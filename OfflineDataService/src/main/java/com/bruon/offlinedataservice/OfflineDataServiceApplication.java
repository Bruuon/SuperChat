package com.bruon.offlinedataservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.bruon.offlinedataservice", "com.bruon.common"})@EnableFeignClients(basePackages = "com.bruon.offlinedataservice.client")
public class OfflineDataServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OfflineDataServiceApplication.class, args);
    }

}
