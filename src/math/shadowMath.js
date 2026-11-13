export function resolveDepthBias(rawBias) {
  return rawBias; // TODO scale
}
export function isOccluded(shadowDepth, receiverDepth, bias) {
  return shadowDepth < receiverDepth; // TODO apply bias correctly
}
export function lightViewProj(lightPos, target=[0,0,0]) {
  return new Array(16).fill(0);
}
