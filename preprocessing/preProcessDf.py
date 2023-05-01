import pandas as pd
import numpy as np
from pathlib import Path

COL_MAP = {'time': 'timestamp',
 'location': 'currentLocation',
 'pId': 'participantId',
 'mode': 'currentMode',
 'hunger': 'hungerStatus',
 'sleep': 'sleepStatus',
 'aptId': 'apartmentId',
 'balance': 'availableBalance',
 'jId': 'jobId',
 'finance': 'financialStatus',
 'food': 'dailyFoodBudget',
 'extra': 'weeklyExtraBudget'}

PARSING_MAPS = {
    'time':"%Y-%m-%d %H:%M:%S"
}

LOCATION_COLS = {
    'x':'x',
    'y':'y'
}

LOCATION_PARSING_REGEX = {
    'x':r'([-]*[0-9]+\.[0-9]+)',
    'y':r'(\s[0-9]+\.[0-9]+)'
}

participantIDColName = 'participantId'

DATA_PATH = r"data\VAST-Challenge-2022\Datasets"

MAIN_ACTIVITY_PATH = r"data\VAST-Challenge-2022\Datasets\Activity Logs"
FILE_SUFFIX = r"ParticipantStatusLogs"
SAVING_PATH = r"data\VAST-Challenge-2022\Datasets\ReducedData"
FILE_SUFFIX_PARTICIPANT = r"Activity"
def processDateTime(df,alias):
    """
    :params df: dataframe
    :params alias:columns alias thats in COL_MAP
    """
    df[COL_MAP[alias]] = pd.to_datetime(df[COL_MAP[alias]],format=PARSING_MAPS[alias])
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

def collectParticipantDataframe(df,alias,id,dict_collection):
    """
    :params df: dataframe
    :params id:id of participant
    :params alias:columns alias thats in COL_MAP
    :params dict_collection:a dictionary of all participant relevant dataframe from each Activity log file
    """
    df_participant = df.loc[df[COL_MAP[alias]]==id]
    if df_participant.shape[0] > 0 :
        dict_collection[len(dict_collection)] = df_participant
    return dict_collection

def readActivityLogs():
    """
    Creates a dictionary of data relevant to each participant from the activity logs
    :params id:id of participant
    """
    tmp = []
    for i in range(1,73):
        print(f"------------Reading {FILE_SUFFIX}{i}------------")
        filepath = f'{MAIN_ACTIVITY_PATH}/{FILE_SUFFIX}{i}.csv'
        df = pd.read_csv(filepath)
        tmp.append(df)
        # print(f"--------Done Reading {FILE_SUFFIX}{i}------------")
    full_activity_log = pd.concat(tmp, axis = 0,ignore_index=True)
    # return dict_collection
    return full_activity_log

def getDuplicatedIdx(df_participantArray):
    """
    Function to get all duplicated indices
    :params df_participantArray:Numpy array of data
    """
    non_duplicated_idx = (df_participantArray[:-1] != df_participantArray[1:])
    #sum across columns. The sum will be 1 if the row is not duplicated, 0 if duplicated
    non_duplicated_idx = non_duplicated_idx.sum(axis = 1).astype(bool).reshape(-1,)
    non_duplicated_idx = np.concatenate(([True],non_duplicated_idx))
    return non_duplicated_idx

def removeAdjacentDuplicates(df_participant):
    """
    Function to remove adjascent duplicate rows
    :params participant_dict:dictionary of data relevant to a participant from all activity logs
    """
    df_participant = processDateTime(df_participant,'time')
    df_participant = processLocation(df_participant,'location',['x','y'])

    col_mapSub = COL_MAP.copy()
    col_mapSub.pop('location')
    col_mapSub.update(LOCATION_COLS)

    df_participant = df_participant.sort_values(by=col_mapSub['time'],ascending=True)

    firstEntry = df_participant.iloc[0,:].to_numpy()
    lastEntry = df_participant.iloc[-1,:].to_numpy()

    df_participant = df_participant.iloc[1:-1,:]

    df_participantArray = df_participant[{k:v for k,v in col_mapSub.items() if k!="time"}.values()].values
    non_duplicated_idx = getDuplicatedIdx(df_participantArray)

    df_participant = df_participant[non_duplicated_idx]
    df_participantArray = np.vstack((firstEntry,df_participant.to_numpy(),lastEntry))
    df_participant = pd.DataFrame(df_participantArray,columns = col_mapSub.values())
    return df_participant

def processDataofParticipants(id_path):
    ids = list(pd.read_csv(id_path)[participantIDColName].astype(int))
    full_data = readActivityLogs()
    for id in ids:
        print(f"-------Doing Participant {id}------")
        id_data = full_data.loc[full_data.participantId == id].copy(deep=True)
        df_participant = removeAdjacentDuplicates(id_data)
        save_path = Path(Path(SAVING_PATH,f"{FILE_SUFFIX_PARTICIPANT}_{id}.csv")).resolve()
        df_participant.to_csv(save_path,index = False)
        print(f"-------Done Participant {id}------")