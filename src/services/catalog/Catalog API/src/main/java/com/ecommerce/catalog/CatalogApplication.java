package com.ecommerce.catalog;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CatalogApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.directory("./src") // caminho até a raiz onde está o .env
				.ignoreIfMissing()
				.load();

		dotenv.entries().forEach(entry ->
				System.setProperty(entry.getKey(), entry.getValue())
		);
		System.out.println("Diretório atual: " + System.getProperty("user.dir"));

		SpringApplication.run(CatalogApplication.class, args);
	}

}
