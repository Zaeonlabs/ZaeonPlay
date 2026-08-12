cmake_minimum_required(VERSION 3.28)

project(streamplugins VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find OBS Studio
if(NOT DEFINED OBS_SOURCE_DIR)
  message(FATAL_ERROR "OBS_SOURCE_DIR not set. Point it to the obs-studio source directory.")
endif()

# Include OBS plugin helper macros
include("${OBS_SOURCE_DIR}/cmake/common/bootstrap.cmake")

# Plugin target
add_library(streamplugins MODULE
  src/plugin-main.cpp
)

target_include_directories(streamplugins PRIVATE
  "${OBS_SOURCE_DIR}/libobs"
  "${OBS_SOURCE_DIR}/frontend"
)

target_link_libraries(streamplugins
  OBS::libobs
  OBS::frontend-api
)

# Install to OBS plugin directory structure
set_target_properties(streamplugins PROPERTIES
  OUTPUT_NAME "streamplugins"
  PREFIX ""
)

# Copy data files
install(TARGETS streamplugins
  LIBRARY DESTINATION "obs-plugins/64bit"
  RUNTIME DESTINATION "obs-plugins/64bit"
)

install(DIRECTORY data/
  DESTINATION "data/obs-plugins/streamplugins"
)
