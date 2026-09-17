package com.bruon.realtimeservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.bruon.realtimeservice", "com.bruon.common"})@EnableFeignClients(basePackages = "com.bruon.realtimeservice.client")
public class RealTimeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RealTimeServiceApplication.class, args);
    }

}
