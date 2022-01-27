package com.sample.service;

import com.couchbase.client.core.deps.com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static com.sample.constant.webConstant.*;

@Slf4j
@Service
@AllArgsConstructor
public class WeatherService {

    public Map<String, Object> weatherInfo() throws Exception {
        /*
            http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0
            일반 인증키
            (Encoding)
            FYzIvgpwksCXlv54%2BMN8wG8Nk84RTr5AdA%2FBqJq%2BoEDXoQMblY8%2FsP%2Ftp7m0UYQ7YmFCGU7GhBKv33a4PVWAZA%3D%3D
            일반 인증키
            (Decoding)FYzIvgpwksCXlv54+MN8wG8Nk84RTr5AdA/BqJq+oEDXoQMblY8/sP/tp7m0UYQ7YmFCGU7GhBKv33a4PVWAZA==
        */

            LocalDateTime current = LocalDateTime.now();
            String currentYmd = current.format(DATE_FORMATTER_YMD);
            String currentHm = current.format(DATE_FORMATTER_HHmm);



        String url = UriComponentsBuilder
                .fromUriString("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst")
                .queryParam("serviceKey", SERVICE_KEY)
                .queryParam("numOfRows", 10)
                .queryParam("pageNo", 1)
                .queryParam("dataType", "JSON")
                .queryParam("base_date", currentYmd)
                .queryParam("base_time", currentHm)
                .queryParam("nx", 60)
                .queryParam("ny", 127)
                .build().toUriString();

        URL apiURL = new URL(url);

        HttpURLConnection conn = null;
        BufferedReader br = null;
        BufferedWriter bw = null;

        boolean isPost = false;

        Map<String, Object> resultMap = new HashMap<String, Object>();

        try {
            conn = (HttpURLConnection) apiURL.openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setDoOutput(true);

            if (isPost) {
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", MediaType.APPLICATION_JSON_VALUE);
                conn.setRequestProperty("Accept", "*/*");
            } else {
                conn.setRequestMethod("GET");
            }

            conn.connect();

            if (isPost) {
                bw = new BufferedWriter(new OutputStreamWriter(conn.getOutputStream(), "UTF-8"));
                bw.write("");
                bw.flush();
                bw = null;
            }

            br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));

            String line = null;

            StringBuffer result = new StringBuffer();

            while ((line=br.readLine()) != null) result.append(line);

            ObjectMapper mapper = new ObjectMapper();

            resultMap = mapper.readValue(result.toString(), HashMap.class);


        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception(url + " interface failed" + e.toString());
        } finally {
            if (conn != null) conn.disconnect();
            if (br != null) br.close();
            if (bw != null) bw.close();
        }

        return resultMap;
    }
}
