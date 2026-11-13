export const MAIN_FRAG = `#version 300 es
precision highp float;

uniform sampler2D uShadowMap;
uniform vec3 uLightDir;
uniform vec3 uBaseColor;
uniform float uBias;

in vec3 vNormal;
in vec3 vWorldPos;
in vec4 vLightSpacePos;

out vec4 outColor;

float isOccluded(vec4 lightSpacePos, float bias) {
  vec3 projected = lightSpacePos.xyz / lightSpacePos.w;
  projected = projected * 0.5 + 0.5;

  if (projected.x < 0.0 || projected.x > 1.0 ||
      projected.y < 0.0 || projected.y > 1.0 ||
      projected.z > 1.0) {
    return 0.0;
  }

  float shadowDepth = texture(uShadowMap, projected.xy).r;
  return float(shadowDepth + bias < projected.z);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightDir);
  float diffuse = max(dot(normal, lightDir), 0.0);
  float shadow = isOccluded(vLightSpacePos, uBias);
  vec3 color = uBaseColor * (0.55 + diffuse * (1.0 - shadow * 0.8));
  outColor = vec4(color, 1.0);
}
`;
