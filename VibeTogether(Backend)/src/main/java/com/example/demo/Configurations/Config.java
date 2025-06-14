package com.example.demo.Configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration class that sets up STOMP messaging
 * for real-time communication between the frontend and backend.
 */
@Configuration
@EnableWebSocketMessageBroker  // Enables WebSocket message handling using STOMP protocol
public class Config implements WebSocketMessageBrokerConfigurer {

    /**
     * Configures message broker options.
     * 
     * - enableSimpleBroker("/topic") sets the destination prefix clients will subscribe to
     *   (e.g., /topic/room123).
     * - setApplicationDestinationPrefixes("/app") sets the prefix used to route messages
     *   from clients to @MessageMapping controller methods.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");              // Enables simple in-memory broker for broadcasting
        config.setApplicationDestinationPrefixes("/app"); // Routes client messages starting with /app to @MessageMapping
    }

    /**
     * Registers the STOMP endpoint that the frontend will use to connect.
     * 
     * - "/server" is the endpoint clients connect to with SockJS.
     * - setAllowedOriginPatterns("*") allows all origins (CORS).
     * - withSockJS() enables fallback options for browsers that don't support WebSocket.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/server")                   // Client will connect to /server via SockJS
                .setAllowedOriginPatterns("*")            // Allows all cross-origin requests (you may restrict this in production)
                .withSockJS();                            // Enables SockJS fallback
    }
}
