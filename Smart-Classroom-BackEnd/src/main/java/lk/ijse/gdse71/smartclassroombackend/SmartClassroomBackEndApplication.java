package lk.ijse.gdse71.smartclassroombackend;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartClassroomBackEndApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartClassroomBackEndApplication.class, args);
    }

    @Bean
    public ModelMapper modelMapper(){
        return new ModelMapper();
    }

    /*
     * Why we use ModelMapper:
     *
     * Purpose:
     *   - Automatically maps fields between objects (e.g., Entity ↔ DTO) without
     *     writing repetitive getter/setter mapping code.
     *
     * Advantages:
     *   - Less boilerplate code – No need for manual dto.setName(entity.getName()).
     *   - Faster development – Reduces mapping time in large projects.
     *   - Readable & maintainable – Centralizes mapping logic.
     *   - Supports nested mapping – Can map complex object graphs.
     *
     * Features:
     *   - Convention over configuration – Maps fields with the same name and compatible types automatically.
     *   - Custom mappings – Allows configuring how specific fields should be mapped.
     *   - Type conversion – Converts between compatible data types (e.g., Date ↔ String).
     *
     * When to Use:
     *   - In Layered Architecture (DAO → Entity → DTO → Controller → View).
     *   - When working with REST APIs (Entity ↔ ResponseDTO, RequestDTO ↔ Entity).
     *   - When models have similar field names or need nested object mapping.
     *
     * Potential Drawbacks:
     *   - Slight performance overhead compared to manual mapping.
     *   - Debugging can be harder if mappings are complex and implicit.
     *
     * Scope:
     *   - Singleton bean managed by Spring's application context.
     *
     * Without ModelMapper:
     *   UserDTO dto = new UserDTO();
     *   dto.setId(entity.getId());
     *   dto.setName(entity.getName());
     *   dto.setEmail(entity.getEmail());
     *
     * With ModelMapper:
     *   UserDTO dto = modelMapper.map(entity, UserDTO.class);
     *
     * So, No need to manually set each field.
     *
     */


}
