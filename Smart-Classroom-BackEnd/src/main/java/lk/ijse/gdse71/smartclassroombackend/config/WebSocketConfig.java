package lk.ijse.gdse71.smartclassroombackend.config;

import lk.ijse.gdse71.smartclassroombackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/11/2025 4:48 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    @Bean
    public TaskScheduler customMessageBrokerTaskScheduler() {
        return new ConcurrentTaskScheduler();
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:63342", "http://127.0.0.1:5500")
                .withSockJS()
                .setHeartbeatTime(25000);
        log.info("✅ STOMP endpoints registered");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(customMessageBrokerTaskScheduler());
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
        log.info("✅ WebSocket message broker configured");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                StompCommand command = accessor.getCommand();

                log.debug("🔍 Processing STOMP command: {} from session: {}", command, accessor.getSessionId());

                if (StompCommand.CONNECT.equals(command)) {
                    log.info("🔌 Processing CONNECT command");

                    String token = accessor.getFirstNativeHeader("Authorization");
                    log.debug("🔑 Authorization header present: {}", token != null);

                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                        log.debug("🔑 Extracted JWT token (length: {})", token.length());
                    } else {
                        log.error("❌ Missing or malformed JWT token in Authorization header");
                        throw new IllegalArgumentException("Missing JWT token");
                    }

                    try {
                        if (!jwtUtil.validateToken(token)) {
                            log.error("❌ JWT token validation failed");
                            throw new IllegalArgumentException("Invalid JWT token");
                        }

                        String username = jwtUtil.extractUsername(token);
                        log.info("🎯 Extracted username from token: {}", username);

                        // Create a proper Principal implementation
                        Principal principal = new Principal() {
                            @Override
                            public String getName() {
                                return username;
                            }

                            @Override
                            public String toString() {
                                return "WebSocketPrincipal{name='" + username + "'}";
                            }
                        };

                        accessor.setUser(principal);

                        // CRITICAL FIX: Store user in session attributes for persistence across STOMP commands
                        accessor.getSessionAttributes().put("WEBSOCKET_USER_PRINCIPAL", principal);
                        accessor.getSessionAttributes().put("WEBSOCKET_USERNAME", username);

                        log.info("✅ WebSocket user authenticated and Principal set: {}", username);

                        // Verify the principal was set correctly
                        Principal verifyPrincipal = accessor.getUser();
                        if (verifyPrincipal != null) {
                            log.info("✅ Principal verification successful: {}", verifyPrincipal.getName());
                        } else {
                            log.error("❌ Principal verification failed - still null after setting");
                        }

                    } catch (Exception e) {
                        log.error("❌ JWT processing error: {}", e.getMessage(), e);
                        throw new IllegalArgumentException("JWT validation failed: " + e.getMessage());
                    }

                } else {
                    // For non-CONNECT commands, restore Principal from session attributes
                    Principal storedPrincipal = (Principal) accessor.getSessionAttributes().get("WEBSOCKET_USER_PRINCIPAL");
                    if (storedPrincipal != null) {
                        accessor.setUser(storedPrincipal);
                        log.debug("🔄 Restored Principal from session: {}", storedPrincipal.getName());
                    } else {
                        String storedUsername = (String) accessor.getSessionAttributes().get("WEBSOCKET_USERNAME");
                        if (storedUsername != null) {
                            Principal restoredPrincipal = new Principal() {
                                @Override
                                public String getName() {
                                    return storedUsername;
                                }
                            };
                            accessor.setUser(restoredPrincipal);
                            log.debug("🔄 Recreated Principal from username: {}", storedUsername);
                        }
                    }
                }

                if (StompCommand.SEND.equals(command)) {
                    // Debug message sending
                    Principal user = accessor.getUser();
                    String destination = accessor.getDestination();
                    log.debug("📤 SEND command - User: {}, Destination: {}",
                            user != null ? user.getName() : "null", destination);

                } else if (StompCommand.SUBSCRIBE.equals(command)) {
                    // Debug subscriptions
                    Principal user = accessor.getUser();
                    String destination = accessor.getDestination();
                    log.info("📡 SUBSCRIBE command - User: {}, Destination: {}",
                            user != null ? user.getName() : "null", destination);

                } else if (StompCommand.DISCONNECT.equals(command)) {
                    Principal user = accessor.getUser();
                    log.info("👋 DISCONNECT command - User: {}",
                            user != null ? user.getName() : "null");
                }

                return message;
            }

            @Override
            public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                StompCommand command = accessor.getCommand();

                if (StompCommand.CONNECT.equals(command)) {
                    Principal user = accessor.getUser();
                    if (sent) {
                        log.info("✅ CONNECT completed successfully for user: {}",
                                user != null ? user.getName() : "null");
                    } else {
                        log.error("❌ CONNECT failed for user: {}",
                                user != null ? user.getName() : "null");
                    }
                }
            }
        });
    }
}


/*
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig  implements WebSocketMessageBrokerConfigurer {

    private final JwtcdUtil jwtUtil; // inject your existing JwtUtil

    @Bean
    public TaskScheduler customMessageBrokerTaskScheduler() {
        return new ConcurrentTaskScheduler(); // default scheduler
    }



    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:63342", "http://127.0.0.1:5500")
                //.setAllowedOriginPatterns("*");           // allow all origins for testing

                .withSockJS() // optional if using SockJS
                .setHeartbeatTime(25000);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable multiple destinations
        //registry.enableSimpleBroker("/topic", "/queue", "/user");
        //registry.enableSimpleBroker("/queue");  // only for private messages
        //registry.setApplicationDestinationPrefixes("/app"); // client → server
        //registry.setUserDestinationPrefix("/user");         // /user/queue/... mapping

        registry.enableSimpleBroker("/queue", "/topic")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(customMessageBrokerTaskScheduler());
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
        System.out.println("✅ WebSocket message broker configured");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = accessor.getFirstNativeHeader("Authorization");
                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                    } else {
                        System.out.println("❌ Missing JWT token");
                        throw new IllegalArgumentException("Missing JWT token");
                    }

                    if (!jwtUtil.validateToken(token)) {
                        System.out.println("❌ Invalid JWT token");
                        throw new IllegalArgumentException("Invalid JWT token");
                    }

                    String username = jwtUtil.extractUsername(token);
                    // ✅ NEW (works correctly):
                    Principal principal = new Principal() {
                        @Override
                        public String getName() {
                            return username;
                        }
                    };
                    accessor.setUser(principal);
                    System.out.println("✅ WebSocket user authenticated: {} "+ username);
                }

                return message;
            }
        });
    }

}*/
