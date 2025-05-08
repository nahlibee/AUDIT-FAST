package com.sapaudit.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for JWT token generation and validation.
 * This class is bound to the 'app.jwt' properties in application.properties.
 */
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Data
public class JwtConfig {

    /**
     * The secret key used to sign the JWT token.
     * This should be a strong, unique key in production environments.
     */
    private String secret;

    /**
     * The expiration time of the JWT token in milliseconds.
     * Default is set to 24 hours (86400000 milliseconds).
     */
    private long expiration = 86400000; // 24 hours

    /**
     * The issuer of the JWT token.
     * This can be used to identify your application as the source of the token.
     */
    private String issuer = "auth-service";

    /**
     * The name of the HTTP header to use for the JWT token.
     * Default is 'Authorization'.
     */
    private String headerName = "Authorization";

    /**
     * The prefix to use for the JWT token in the HTTP header.
     * Default is 'Bearer '.
     */
    private String headerPrefix = "Bearer ";

    /**
     * Returns the token prefix with a space for easier parsing.
     * 
     * @return The token prefix
     */
    public String getTokenPrefix() {
        // Ensure the prefix ends with a space for proper header formatting
        if (!headerPrefix.endsWith(" ")) {
            return headerPrefix + " ";
        }
        return headerPrefix;
    }

    /**
     * Returns the token prefix length for easier token extraction.
     * 
     * @return The token prefix length
     */
    public int getTokenPrefixLength() {
        return getTokenPrefix().length();
    }
}