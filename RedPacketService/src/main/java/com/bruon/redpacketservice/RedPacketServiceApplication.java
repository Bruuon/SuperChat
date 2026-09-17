package com.bruon.redpacketservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.bruon.redpacketservice", "com.bruon.common"})
public class RedPacketServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RedPacketServiceApplication.class, args);
    }

}
