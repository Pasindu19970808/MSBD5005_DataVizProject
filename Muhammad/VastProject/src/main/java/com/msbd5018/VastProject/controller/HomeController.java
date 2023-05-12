package com.msbd5018.VastProject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
	@GetMapping("/home")
	public String goToMainPage() {
		return "home";
	}
	
	@GetMapping("/life")
	public String goToPatternsOfLifePage() {
		return "life";
	}
	
	@GetMapping("/pokemon")
	public String goToEconomiesPage() {
		return "pokemon";
	}
	
	@GetMapping("/econ1")
	public String goToEcon1Page() {
		return "econ1";
	}
	
	@GetMapping("/econ2")
	public String goToEcon2Page() {
		return "econ2";
	}
	
	@GetMapping("/econ3")
	public String goToEcon3Page() {
		return "econ3";
	}
	
	@GetMapping("/start")
	public String goToStartPage() {
		return "start";
	}
	
}


