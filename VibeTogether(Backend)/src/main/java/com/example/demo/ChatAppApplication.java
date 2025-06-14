package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The main entry point of the Spring Boot application.
 * 
 * @SpringBootApplication is a convenience annotation that adds:
 * - @Configuration: Tags the class as a source of bean definitions
 * - @EnableAutoConfiguration: Tells Spring Boot to start adding beans based on classpath settings
 * - @ComponentScan: Enables component-scanning so that other components, configurations, and services
 *   in the package can be automatically discovered and registered as beans
 */
@SpringBootApplication
public class ChatAppApplication {

    /**
     * The main method that launches the Spring Boot application.
     *
     * @param args Command-line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(ChatAppApplication.class, args);
    }

}
