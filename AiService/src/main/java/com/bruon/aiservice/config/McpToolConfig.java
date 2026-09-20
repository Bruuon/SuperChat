package com.bruon.aiservice.config;

import java.util.Arrays;
import java.util.Map;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;
import dev.langchain4j.mcp.client.transport.http.StreamableHttpMcpTransport;
import dev.langchain4j.mcp.client.transport.stdio.StdioMcpTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class McpToolConfig {

    @Value("${bigmodel.api-key}")
    private String apiKey;

    @Bean
    public McpToolProvider mcpToolProvider() {



        McpTransport searchTransport = new StreamableHttpMcpTransport.Builder()
                .url("https://open.bigmodel.cn/api/mcp/web_search_prime/mcp")
                .customHeaders(Map.of("Authorization", "Bearer " + apiKey.trim()))
                .logRequests(true)
                .logResponses(true)
                .build();

        McpClient searchClient = new DefaultMcpClient.Builder()
                .key("BigModelSearchMcpClient")
                .transport(searchTransport)
                .build();


//        McpTransport timeTransport = new StdioMcpTransport.Builder()
//                .command(Arrays.asList("uvx", "mcp-server-time", "--local-timezone=Asia/Shanghai"))
//                .build();
//
//        McpClient timeClient = new DefaultMcpClient.Builder()
//                .key("timeClient")
//                .transport(timeTransport)
//                .build();
//
//
//        return McpToolProvider.builder()
//                .mcpClients(Arrays.asList(timeClient, searchClient))
//                .build();

        return McpToolProvider.builder()
                .mcpClients(searchClient)
                .build();
    }
}