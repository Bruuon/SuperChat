package com.bruon.aiservice;

import dev.langchain4j.community.store.embedding.redis.spring.RedisEmbeddingStoreAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

//@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class}, scanBasePackages = {"com.bruon.gateway", "com.bruon.common"})
@SpringBootApplication(exclude = {RedisEmbeddingStoreAutoConfiguration.class}, scanBasePackages = {"com.bruon.aiservice", "com.bruon.common"})
public class AiServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiServiceApplication.class, args);
    }

}
