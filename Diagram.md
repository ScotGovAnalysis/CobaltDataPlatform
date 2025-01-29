graph LR
    %% Define Users
    subgraph Users
        EndUsers["End Users"]
        AdminUsers["Admin Users"]
    end

    %% CKAN Container
    subgraph "EC2 Cloud Server"
        
        subgraph "CKAN Docker Container"
            CKAN_FE["CKAN Frontend (Admin Interface)"]
            CKAN_MW["CKAN Middleware (REST APIs)"]
            CKAN_DB["CKAN Datastore (PostgreSQL)"]
            
            CKAN_FE --> CKAN_MW --> CKAN_DB
        end

     subgraph "Custom Frontend"
            CustomUI["Custom UI (React)"]
            
            subgraph "Core Features"
                Search["Dataset Search"]
                Download["Download Service"]
                Analysis["Analysis Tools"]
                Help["Help Page"]
            end
        
        CustomUI -->|Includes| Search
        CustomUI -->|Includes| Download
        CustomUI -->|Includes| Analysis
        CustomUI -->|Includes| Help
    end
    end

    %% Custom Frontend
   

    %% User Connections
    EndUsers --> CustomUI
    AdminUsers --> CKAN_FE

    %% Frontend to CKAN connections
    CustomUI -.->|API Calls| CKAN_MW
