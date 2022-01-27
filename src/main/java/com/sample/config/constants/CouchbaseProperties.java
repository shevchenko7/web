package com.sample.config.constants;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "cache.couchbase")
public class CouchbaseProperties {

    private String username;
    private String password;
    private List<String> ip;
    private String bucket;
    private Env env;

    @Data
    public static final class Env {

        private int keyValue;
        private int maxEndpoints;
    }

    public String getConnectionString() {
        return String.join(",", this.ip);
    }
}
