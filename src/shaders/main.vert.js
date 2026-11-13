export const MAIN_VERT = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4 uViewProj;
uniform mat4 uModel;
uniform mat4 uLightSpace;

out vec3 vNormal;
out vec3 vWorldPos;
out vec4 vLightSpacePos;

void main() {
  vec4 worldPos = uModel * vec4(aPos, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = mat3(uModel) * aNormal;
  vLightSpacePos = uLightSpace * worldPos;
  gl_Position = uViewProj * worldPos;
}
`;
