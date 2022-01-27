package com.sample.config;

import com.couchbase.client.core.env.IoConfig;
import com.couchbase.client.java.env.ClusterEnvironment;
import com.sample.config.constants.CouchbaseProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.couchbase.config.AbstractCouchbaseConfiguration;

@Slf4j
//@Configuration
public class CouchbaseConfig extends AbstractCouchbaseConfiguration {

    private CouchbaseProperties couchbaseProperties;

    CouchbaseConfig(CouchbaseProperties couchbaseProperties) {
        log.info("Initialize couchbase properties. username:{}, password:{}, ip:{}, bucket:{}, env:{}",
                 couchbaseProperties.getUsername(),
                 couchbaseProperties.getPassword(),
                 couchbaseProperties.getIp(),
                 couchbaseProperties.getBucket(),
                 couchbaseProperties.getEnv());
        this.couchbaseProperties = couchbaseProperties;
    }

    @Override
    public String getConnectionString() {
        return couchbaseProperties.getConnectionString();
    }

    @Override
    public String getUserName() {
        return couchbaseProperties.getUsername();
    }

    @Override
    public String getPassword() {
        return couchbaseProperties.getPassword();
    }

    @Override
    public String getBucketName() {
        return couchbaseProperties.getBucket();
    }

    @Override
    protected void configureEnvironment(final ClusterEnvironment.Builder builder) {
        builder.ioConfig(
            IoConfig.numKvConnections(couchbaseProperties.getEnv().getKeyValue())
                    .maxHttpConnections(couchbaseProperties.getEnv().getMaxEndpoints())
        );
    }

}
