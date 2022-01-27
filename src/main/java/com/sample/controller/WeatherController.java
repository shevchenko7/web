package com.sample.controller;

import com.sample.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/weather")
public class WeatherController {


    private final WeatherService weatherService;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() throws Exception {

        return new ResponseEntity<>(weatherService.weatherInfo(), HttpStatus.OK);
    }
}
