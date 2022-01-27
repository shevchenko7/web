package com.sample.config;

import com.sample.util.rest.RestObjectMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/**
 * web config
 */
@Configuration
@EnableWebMvc
public class WebConfig {
    public MappingJackson2HttpMessageConverter createRestClientMappingJacksonHttpMessageConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(RestObjectMapper.ObjectMapper());

        return converter;
    }

//    @Bean
//    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter (ObjectMapper objectMapper) {
//        MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter
//                = new MappingJackson2HttpMessageConverter();
//        mappingJackson2HttpMessageConverter.setObjectMapper(objectMapper);
//
//        return mappingJackson2HttpMessageConverter;
//    }
}
