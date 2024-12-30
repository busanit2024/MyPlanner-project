package com.busanit.myplannerbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8080") //프론트엔드 서버 주소 설정
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .exposedHeaders("Authorization")
                .allowedHeaders("*")
                .allowCredentials(true); // 웹소켓 연결에 필요한 인증 정보 전달 허용(쿠키,http 인증)
    }
}
