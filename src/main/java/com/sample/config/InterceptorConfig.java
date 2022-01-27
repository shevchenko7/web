package com.sample.config;

import com.sample.interceptor.SleuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.sleuth.Tracer;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@RequiredArgsConstructor
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    private final Tracer tracer;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sleuthInterceptor())
                .addPathPatterns("/**/*");
    }

    public SleuthInterceptor sleuthInterceptor() {
        return new SleuthInterceptor(tracer);
    }
}