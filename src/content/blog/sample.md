---
title: 博客示例
published_at: 2024-11-16
blurb: 博客示例
tags: ["blog","Markdown"]
---

## 目的

- 将学习和生活的点滴记录下来，作为回顾和分享😊。

### 显示数学公式

- 单自由度振动的杜哈梅积分法 
- Duhamel Integration Method
- 计算方法：
	- 把地震动（外荷载）时程切成一小段的不同峰值的脉冲荷载
	- 每一段的脉冲荷载作用下，结构做有阻尼的自由振动（慢慢变小的正弦曲线）
	- 把每一段的脉冲荷载作用下的响应（自由振动响应）求和，得到最终的位移时程
- 公式
	- 在时间点 $t=\tau$ 处，脉冲荷载冲量 $I=F\cdot\Delta t$ 对于之后产生的位移按以下公式计算：

$$
u(t)=\frac{I}{m \omega_{n}} e^{-\xi \omega_{n}(t-\tau)} \sin \left(\omega_{n}(t-\tau)\right)
$$
-
    - $\omega_{n}$ 为单质点 $m$ 的结构自振圆频率，
    - $T_n$ 为结构自振周期，
    - $k$ 为结构刚度，
    - $\xi$ 为阻尼系数
$$
\omega_{n}={\frac{2\pi}{T_{n}}} ={\sqrt{\frac{k}{m}}}
$$ 

### 显示表格

---
|环境变量|功能|
|---|---|
|**PYMAPDL_START_INSTANCE**|ansys.mapdl.core.launcher.launch_mapdl() 函数的行为重写，只尝试连接 PyMAPDL 的现有实例。一般与 PYMAPDL_PORT 结合使用。|
|**PYMAPDL_PORT**|PyMAPDL 连接的默认端口。|
|**PYMAPDL_IP**|PyMAPDL 连接的默认 IP。|
|**ANSYSLMD_LICENSE_FILE**|许可证文件或 IP 地址，端口格式为 PORT@IP 。请勿与 MAPDL 实例运行所在的 IP 和 PORT 混淆，后者使用 PYMAPDL_IP 和 PYMAPDL_PORT 指定。这有助于为 Docker 提供许可。|
|**PYMAPDL_MAPDL_EXEC**|启动 MAPDL 实例的可执行路径。|
|**PYMAPDL_MAPDL_VERSION**|在有多个 MAPDL 版本可用的情况下启动的默认 MAPDL 版本。|
|**PYMAPDL_MAX_MESSAGE_LENGTH**|gRPC 消息的最大长度。如果您的连接在运行 PRNSOL 或 NLIST 时终止，请提高该值。以字节为单位，默认为 256 MB。|

### 文字格式

- `**粗体**`   -> **粗体**
- `_斜体_`  -> *斜体*
- `~~删除线~~` -> ~~删除线~~

### 显示代码

```typescript
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

await start(manifest, config);
```