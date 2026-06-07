package br.edu.facul.TriagemIA;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;


@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class TriagemIaApplication {

	public static void main(String[] args) {
		SpringApplication.run(TriagemIaApplication.class, args);
	}
}