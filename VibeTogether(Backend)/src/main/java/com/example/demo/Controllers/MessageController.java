package com.example.demo.Controllers;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.example.demo.Entities.Obj;

/**
 * Controller to handle WebSocket messages via STOMP.
 * Listens for messages from clients and broadcasts them to subscribers.
 */
@Controller
public class MessageController {

    /**
     * Handles incoming messages sent to the destination: /app/url/{st}
     *
     * - @MessageMapping("/url/{st}"): Listens for messages sent to this path.
     * - @SendTo("/topic/return/{st}"): Broadcasts the received message to all subscribers of this topic.
     * - @DestinationVariable String st: Captures the path variable {st} from the destination.
     * - @Payload Obj obj: Extracts the body of the message (your custom object).
     *
     * @param st   The room identifier or custom path variable from the client
     * @param obj  The message payload sent by the client
     * @return     The same object is returned and broadcasted to all clients subscribed to /topic/return/{st}
     */
    @MessageMapping("/url/{st}")
    @SendTo("/topic/return/{st}")
    public Obj getContentC(@DestinationVariable String st, @Payload Obj obj) {

        // Return the received message object to all subscribers
        return obj;
    }
}
