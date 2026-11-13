渲染这边卡阴影上了——别整完整引擎，就帮我把这个 WebGL2 shadow map 小实验补到能跑、测试全绿。别上 Docker。

具体点：
1) 打开 index.html（npm start / python3 -m http.server 8792 --directory .）：左边画布右边参数；正常启动 #status=ready。
2) src/math/shadowMath.js：光空间矩阵 + 深度偏置逻辑要和测试对齐（含 resolveDepthBias、isOccluded 的简化判定）。
3) src/shadowMap.js：创建 depth FBO/纹理封装 createShadowMap(gl, size)，提供 bindForDepthPass / bindForSampling 之类接口（node 测试里用 mock gl 也行）。
4) src/renderer.js：至少两趟——先从光视角写深度，再主相机采样阴影；地面 + 一个立方体够了。
5) src/ui/controls.js：偏置 / 光高度可调，Capture PNG，#stats 写出 mapSize 和 bias。
6) shader 放 src/shaders/。别改弱测试，原生 ESM。分文件短命令写，写完就 npm test，挂了再修到过。
