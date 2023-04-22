import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point,LineString
from pathlib import Path
from topojson import Topology
import altair as alt

INTEREST_MAP = {
    'commute' : 'Work/Home Commute'
}

COL_MAP = {
    'commute' : 'purpose',
    'id_col' : 'participantId',
    'time_journal' : ['travelStartTime','travelEndTime'],
    'time_complete' : ['timestamp'],
    'apartments' : 'apartmentId',
    'apartment_location_col':'location',
    'building_location_col':'location'
}

PARSING_MAPS = {
    'travelStartTime':"%Y-%m-%d %H:%M:%S",
    'travelEndTime':"%Y-%m-%d %H:%M:%S",
    'timestamp' : "%Y-%m-%d %H:%M:%S"
}

GROUP_BY_COLS = {
    'id_col' : 'participantId'
}

LOCATION_COLS = {
    'x':'x',
    'y':'y'
}

LOCATION_PARSING_REGEX = {
    'x':r'([-]*[0-9]+\.[0-9]+)',
    'y':r'(\s[0-9]+\.[0-9]+)'
}


TRAVEL_START_END_COLS = ['participantId','travelStartTime','travelEndTime']
TIMESTAMP_LOCATION_COLS = ['timestamp','participantId','x','y']
PARTICIPANT_APARTMENT_COLS = ['participantId','apartmentId']
APARTMENT_LOCATION_COLS = ['apartmentId','location']
HAPPINESS_COLS = ['participantId','joviality']
BUILDING_COLS = ['buildingId', 'location', 'buildingType']

DATA_PATH = r"D:\Datasets\Projects\VAST Challenge\VAST-Challenge-2022\Datasets"
TRAVEL_JOURNAL = "TravelJournal.csv"
REDUCED_LOGS = "CompleteActivityLogs.csv"
CHANGED_JOB_CSV = "changeJobParticipants.csv"
APARTMENTS_CSV = "Apartments.csv"
PARTICIPANTS_CSV = "Participants.csv"
BUILDING_CSV = "Buildings.csv"
CHANGED_JOB_IDS = pd.read_csv(Path(DATA_PATH,"Attributes",CHANGED_JOB_CSV).resolve())['participantId']

SUBDIR = "Journals"
SUBDIR_APARTMENTS = "Attributes"
SUBDIR_BUILDINGS = "Attributes"


def selectRequiredIds(df,idList):
    df = df.loc[~df[COL_MAP['id_col']].isin(idList)]
    return df

def processDateTime(df,alias):
    """
    :params df: dataframe
    :params alias:columns alias thats in COL_MAP
    """
    for col in COL_MAP[alias]:
        df[col] = pd.to_datetime(df[col],format=PARSING_MAPS[col])
    return df

def processLocation(df,alias,colstoset):
    """
    :params df: dataframe
    :params alias:columns alias thats in COL_MAP
    :params colstoset:keyss from LOCATION_COLS map
    """
    for col in colstoset:
        df[LOCATION_COLS[col]] = pd.Series(df[COL_MAP[alias]]).str.extract(LOCATION_PARSING_REGEX[col])
        df[LOCATION_COLS[col]] = pd.Series(df[LOCATION_COLS[col]]).str.strip()
    df = df.drop(COL_MAP[alias],axis = 1)
    return df

def geoDFProcessing(df,group_by_alias):
    #make each x,y combination into a Point type
    # geometry = [Point(x,y) for x,y in zip(df['x'],df['y'])]
    geometry = [Point(x,y) for i, (x,y) in df['x', 'y'].iterrows()]
    geo_df = gpd.GeoDataFrame(df,geometry=geometry)
    #Collect by the participantId and apply a LineString operation on all the Points to get it in LineString format
    geo_df2 = geo_df.groupby(GROUP_BY_COLS[group_by_alias])['geometry'].apply(lambda x:LineString(x.tolist()))
    geo_df2 = gpd.GeoDataFrame(geo_df2,geometry='geometry')
    return geo_df2


def doFiltering(start_time,end_time,id,complete_df,alias,id_alias):
    temp_df = complete_df.loc[complete_df[COL_MAP[id_alias]] == id][TIMESTAMP_LOCATION_COLS]
    temp_df = temp_df.loc[temp_df[COL_MAP[alias][0]] >= start_time]
    temp_df = temp_df.loc[temp_df[COL_MAP[alias][0]] <= end_time]
    return temp_df


def collectParticipantTimeStampPoints(df,complete_df,id,alias,id_alias):
    for i in range(df.shape[0]):
        start_time = df.iloc[i,1]
        end_time = df.iloc[i,2]
        temp_df = doFiltering(start_time,end_time,id,complete_df,alias,id_alias)
        group_by_alias = id_alias
        gdf = geoDFProcessing(temp_df,group_by_alias)
        yield (i,gdf)
            

def collectParticipantTimeStampBoundaries(df,id_alias,id,complete_df):
    #Assuming that a user takes only 1 route from home to work and work to home,
    #select only the first 2 entries of travel journal
    id_df = df.loc[df[COL_MAP[id_alias]] == id][TRAVEL_START_END_COLS].iloc[:2,:]
    iter_gdf = collectParticipantTimeStampPoints(id_df,complete_df,id,'time_complete',id_alias)
    return iter_gdf

def collectTimeStampLocationPoints(df,id_alias,complete_df):
    linestring_dict = {}
    for i,id in enumerate(df[COL_MAP[id_alias]].unique()):
        if i%50 == 0:
            print(f"--------Doing {i}th ID--------")
        iter_gdf = collectParticipantTimeStampBoundaries(df,id_alias,id,complete_df)
        # for j,linestring in iter_gdf:
        #     linestring_dict[f"{id}_{j}"] = linestring
        try:
            linestring_dict[id] = {j:linestring for j,linestring in iter_gdf}
        except:
            print(list(iter_gdf))
            print(id)
    return linestring_dict


def selectTravelJournal(alias,noJobChange = True):
    #read_df
    travelJournal_df = pd.read_csv(Path(DATA_PATH,SUBDIR,TRAVEL_JOURNAL).resolve())
    print('-------Reading Reduced Complete Logs------------')
    COMPLETE_DF = pd.read_csv(Path(DATA_PATH,REDUCED_LOGS).resolve())
    print('-------Done Reading Reduced Complete Logs-------')

    #select the required type of travel
    travelJournal_df = travelJournal_df.loc[travelJournal_df[COL_MAP[alias]] == INTEREST_MAP[alias]]

    if noJobChange:
        travelJournal_df = selectRequiredIds(travelJournal_df,CHANGED_JOB_IDS)
    print("-------Processing Date Time----------------------")
    travelJournal_df = processDateTime(travelJournal_df,'time_journal')
    COMPLETE_DF= processDateTime(COMPLETE_DF,'time_complete')
    print("-------DONE Processing Date Time-----------------")
    plotting_linestring_dict = collectTimeStampLocationPoints(travelJournal_df,'id_col',COMPLETE_DF)
    print('COMPLETED COLLECTING LINESTRINGS')
    return plotting_linestring_dict

def addHappinessScore(df):
    happiness_df = pd.read_csv(Path(DATA_PATH,SUBDIR_APARTMENTS,PARTICIPANTS_CSV).resolve())[HAPPINESS_COLS]
    happiness_df = df.merge(happiness_df,how = 'left',left_on = 'participantId',right_on = 'participantId')
    return happiness_df
    

def addApartmentCoordinates(df):
    apartment_df = pd.read_csv(Path(DATA_PATH,SUBDIR_APARTMENTS,APARTMENTS_CSV).resolve())[APARTMENT_LOCATION_COLS]
    df = df.merge(apartment_df,how = 'left',left_on = 'apartmentId',right_on = 'apartmentId')
    return df


def dropDuplicateRecords(df,subset):
    df = df.drop_duplicates(subset = subset)[PARTICIPANT_APARTMENT_COLS]
    return df

def processUsingWKT(df,location_alias):
    df['geometry'] = gpd.GeoSeries.from_wkt(df[COL_MAP[location_alias]])
    return df

def makeGeoDF(df):
    gdf = gpd.GeoDataFrame(df,geometry='geometry')
    return gdf

def makeTOPOJSON(gdf):
    topojson_data = Topology(gdf,prequantize=False).to_json()
    return topojson_data

def turnToAltairFormat(topojsondata):
    data_topojson = alt.InlineData(values = topojsondata,format = alt.DataFormat(feature = 'data',type = 'topojson'))
    return data_topojson

def processApartmentParticipantDetails(alias,duplicate_alias):
    print('-------Reading Reduced Complete Logs------------')
    COMPLETE_DF = pd.read_csv(Path(DATA_PATH,REDUCED_LOGS).resolve())
    print('-------Done Reading Reduced Complete Logs-------')
    participantApartment_dict = {k:dropDuplicateRecords(grp,COL_MAP[duplicate_alias]) for k,grp in COMPLETE_DF.groupby(COL_MAP[alias])}
    df = pd.concat(participantApartment_dict,ignore_index=True)
    #some participants do now have apartments
    #Drop them
    df = df.dropna().reset_index(drop = True)
    df[COL_MAP[alias]] = df[COL_MAP[alias]].astype(int)
    df[COL_MAP[duplicate_alias]] = df[COL_MAP[duplicate_alias]].astype(int)
    #Add apartment coordinates
    df = addApartmentCoordinates(df)
    #process Location
    df = processLocation(df,'apartment_location_col',['x','y'])
    return df

def processBuildingData(alias):
    BUILDING_DF = pd.read_csv(Path(DATA_PATH,SUBDIR_BUILDINGS,BUILDING_CSV).resolve())[BUILDING_COLS]
    df = processUsingWKT(BUILDING_DF,alias)
    gdf = makeGeoDF(df)
    topojson = makeTOPOJSON(gdf)
    alt_data = turnToAltairFormat(topojson)
    return alt_data



