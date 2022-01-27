package com.sample.config;

import com.sample.util.ResourceRoute;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@Getter
@ConfigurationProperties(prefix = "resource")
public class ResourceRouteConfig {

    Map<String, ResourceRoute> resourceRoutes = new HashMap<>();

    public String getUrl(String apiId) {
        return getResourceRoute(apiId).getUrl();
    }

    public ResourceRoute getResourceRoute(String apiId) {
        return resourceRoutes.get(apiId);
    }
}
