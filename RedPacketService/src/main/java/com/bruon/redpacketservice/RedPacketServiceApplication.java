package com.bruon.redpacketservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.bruon.redpacketservice", "com.bruon.common"})
@EnableFeignClients(basePackages = "com.bruon.redpacketservice.client")
public class RedPacketServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RedPacketServiceApplication.class, args);
    }

}
