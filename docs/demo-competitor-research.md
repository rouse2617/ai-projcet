# 模具报价 Demo 调研与迭代建议

更新时间：2026-04-18

## 目标

先做一个可演示的模具/注塑报价 Demo，用来向客户或内部团队说明产品方向；后续再逐步从“静态计算器”升级为“上传图纸 + DFM + 报价协同”的真实业务系统。

## 当前判断

现有项目已经具备一个基础雏形：

- 模具成本估算
- 注塑件单件成本估算
- 成本拆分可视化

但它目前更像“前端公式计算器”，还不像行业里常见的线上报价平台。真正能打动客户的演示，一般不是只填表，而是让用户感受到：

- 可以上传图纸
- 可以快速拿到价格区间和交期
- 可以看到结构/工艺风险提示
- 复杂项目会转人工工程师复核

## 行业竞品结论

### 1. 国外主流做法

国外成熟平台已经比较统一，核心链路通常是：

1. 上传 3D/2D 文件
2. 选择工艺、材料、数量、表面处理
3. 系统给出价格、交期、DFM 反馈
4. 复杂件转人工工程师审核
5. 在线确认、打样、T1 样审批、复购

代表案例：

- Protolabs
  - 强项是数字化报价和制造分析
  - 报价结果里可调整数量、材料、交期
  - 适合参考它的“交互式报价”结构
- Xometry
  - 强项是“自动估价 + 专家最终确认”
  - 适合参考它的“先给预算，再人工收口”
- Fictiv
  - 强项是“瞬时报价 + DFM + 工程师协同 + 模具管理”
  - 最适合参考其产品路径
- ICOMold
  - 强项是“30 秒在线报价”的感知速度
  - 很适合参考它的 Demo 展示方式

### 2. 国内主流做法

国内公开可见的模式分两类：

- 平台撮合型
  - 代表：海智在线
  - 逻辑：提交 RFQ，由平台匹配工厂，24 小时内拿多家报价
  - 优点：适合复杂件、非标件、供应链整合
  - 缺点：产品演示时“自动化感”偏弱
- 数字制造型
  - 代表：RapidDirect、云工厂、裕禾智造
  - 逻辑：上传图纸，先给预估价格/DFM/交期，再进入工程沟通
  - 优点：更适合做线上 Demo，也更符合你现在这个项目的演进方向

### 3. 一个重要结论

真正复杂的注塑/模具业务，很少完全依赖纯自动报价闭环。

更现实的产品结构通常是：

- 简单件：自动估价
- 中等复杂件：自动预估 + 风险提示
- 复杂件：提示“需工程师复核”

这比“所有项目都算出一个固定价格”更真实，也更容易让客户相信。

## 对当前 Demo 的建议

### Demo 第一阶段应该做什么

第一阶段不建议追求“全自动成交平台”，而应该先做一个可信的演示型产品。

建议把当前项目升级为：

### 方案名称

上传图纸驱动的模具/注塑智能估价 Demo

### 首页核心路径

首页第一屏建议直接变成：

- 上传 3D/2D 图纸
- 选择工艺：模具 / 注塑 / 先打样后量产
- 选择材料、数量、表面要求、精度等级
- 立即获取估价结果

### 报价结果页建议包含

- 模具费
- 单件费
- 建议最小起订量
- 交期区间
- 成本构成图
- 适合工艺建议
- DFM 风险提示
- 是否需要工程师复核

### DFM 第一版不需要做太深

第一版只做几个用户能看懂、也最有业务价值的提示即可：

- 壁厚是否可能不均
- 是否缺少拔模
- 是否存在倒扣/侧抽风险
- 穴数建议
- 热流道是否建议
- 公差要求是否偏严
- 表面纹理/抛光是否明显增加成本

这样就已经比“普通成本计算器”高一个层级了。

## 建议的产品分阶段路线

### V1：演示版 Demo

目标：先把“像一个行业产品”做出来。

建议能力：

- 首页支持上传入口（哪怕先只做 UI，不做真实解析）
- 保留现有模具/注塑计算逻辑
- 增加报价结果页的业务表达
- 增加轻量 DFM 提示规则
- 增加“工程师复核”分流按钮
- 增加典型场景示例数据

用户感知关键词：

- 上传图纸
- 秒级估价
- 风险提示
- 交期预测
- 人工复核

### V2：半自动报价版

目标：从“能演示”升级为“能辅助真实销售和工程报价”。

建议能力：

- 文件上传后保存项目记录
- 支持多个零件/多个版本
- 报价单导出 PDF
- 后台可编辑材料、费率、加工模板
- 工程师对自动结果进行修正
- 客户端看到“初步报价 / 最终报价”状态

### V3：业务化平台版

目标：真正进入业务闭环。

建议能力：

- CAD 特征提取
- 更完整的 DFM 规则系统
- 模具结构模板库
- 多工艺比价（注塑 / CNC / 3D 打印 / 复模）
- 项目协同、审批、订单跟踪
- 模具库、复购、历史版本对比

## 你这个项目最适合学习谁

如果只选两个参考对象，建议优先看：

### 1. Fictiv

原因：

- 自动化和人工工程服务结合得最好
- 对复杂件不过度承诺“纯自动”
- 很适合做从 Demo 到真实产品的过渡路线

### 2. RapidDirect

原因：

- 更接近国内客户熟悉的表达方式
- 页面结构、能力表达、平台感都适合本项目借鉴
- “即时报价 + DFM + 工程协作 + 订单管理”的框架比较完整

## 对你当前项目的直接建议

短期内，不要把它继续做成“更复杂的纯表单”。

更值得优先投入的是：

1. 把入口从“填写参数”改成“上传图纸 + 选择业务条件”
2. 把结果从“公式结果”改成“报价视图”
3. 把可信度建立在“自动估价 + 工程师复核”上

这三步做完，整体观感会从“工具页”变成“行业产品 Demo”。

## 后续可执行项

如果继续推进，这个项目下一步建议直接做下面四件事：

1. 重做首页 Hero，突出上传图纸和即时报价
2. 新增“报价结果页”信息架构
3. 增加轻量 DFM 风险卡片
4. 增加“需工程师复核”分支

## 参考链接

- Protolabs Quoting Platform  
  https://www.protolabs.com/en-gb/help-centre/quoting-platform/
- Protolabs Online Digital Manufacturing Services  
  https://www.protolabs.com/Services/
- Xometry How It Works  
  https://www.xometry.com/how-xometry-works/
- Xometry Injection Molding Auto-Quote News  
  https://investors.xometry.com/news-releases/news-release-details/xometry-introduces-auto-quote-capability-injection-molding/
- Fictiv Injection Molding Service  
  https://www.fictiv.com/injection-molding-service
- Fictiv Instant Injection Molding Quote  
  https://www.fictiv.com/articles/instant-injection-molding-quote-online
- ICOMold Instant Quote  
  https://icomold.com/icoquote/
- ICOMold Quote Portal  
  https://projects.icomold.com/Register.aspx
- RapidDirect 首页  
  https://rapiddirect.com/zh-CN/
- RapidDirect 注塑服务  
  https://www.rapiddirect.com/zh-CN/services/injection-molding/
- 云工厂注塑在线报价  
  https://yungongchang.com/zh-cn/quote/injection-molding/
- 海智在线  
  https://www.haizol.com/
- 裕禾智造  
  https://yuhezhizao.com/zh-cn/
