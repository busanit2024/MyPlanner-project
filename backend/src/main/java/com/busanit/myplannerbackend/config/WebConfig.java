package com.busanit.myplannerbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 일반 HTTP 요청에 대한 CORS 설정
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") //프론트엔드 서버 주소 설정
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .exposedHeaders("Authorization")
                .allowedHeaders("*")
                .allowCredentials(true); // 웹소켓 연결에 필요한 인증 정보 전달 허용(쿠키,http 인증)

        // SockJS 엔드포인트에 대한 CORS 설정
        registry.addMapping("/chat/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("*")
                .allowCredentials(true);

        // WebSocket handshake에 대한 CORS 설정
        registry.addMapping("/chat/info")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
