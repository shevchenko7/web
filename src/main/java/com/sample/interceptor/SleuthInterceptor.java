package com.sample.interceptor;

import org.springframework.cloud.sleuth.Tracer;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SleuthInterceptor implements HandlerInterceptor {

    private Tracer tracer;

    public SleuthInterceptor(Tracer tracer) {
        this.tracer = tracer;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String traceId = tracer.nextSpan().context().traceId();
        String spanId = tracer.nextSpan().context().spanId();
        sleuthTraceGuidVoidCall(traceId);
        sleuthSpanGuidVoidCall(spanId);
        return true;
    }

    private void sleuthTraceGuidVoidCall(String traceId) {
    }

    private void sleuthSpanGuidVoidCall(String spanId) {
    }
}