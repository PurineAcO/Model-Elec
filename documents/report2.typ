#import "lib.typ": *
#import "@preview/cetz:0.4.2"

#set footnote(numbering: (..args) => {
  args.pos().at(0) * "†"
})

#let custom-title-page() = {
  set align(center)
  set block(width: 100%, height: 100%)
  set text(weight: "regular", size: 55pt, font: "STZhongSong")
  
  v(1fr)
  [实验报告]
  v(2fr)
}

#let custom-title-page-author()={
  // v(1.1fr)
  set align(center)
  set block(width: 100%, height: 100%)
  set text(weight:"regular", size: 18pt, font: "KaiTi")
  v(0.6fr)
  [北京航空航天大学 沈元学院]
  v(0.1fr)
  [王诗博]
  v(1.5fr)
}

// 使用自定义封面
#custom-title-page()

#custom-title-page-author()

#pagebreak()

// 以下是正文部分(可选)
#show: project.with(
  title: "滤波器频率特性的探究",
  date: auto,
  abstract: [本实验围绕RC电路的频率特性及信号响应规律展开探究,通过函数发生器、示波器等仪器,系统测试了RC电路在正弦波与方波信号激励下的输出特性。通过改变 RC 参数观测方波信号的响应,明确了微分电路输出尖脉冲、积分电路输出三角波的典型特征;通过测试100Hz至500kHz频段内的电压放大倍数,结合理论公式拟合,证实了RC电路频率响应符合分压规律。#footnote[合作者:金鼎哲]],
  keywords: ("RC电路", "微分与积分电路", "滤波规律")
)

= 实验目的
1. 掌握函数发生器、示波器的使用
2. 通过实验探究滤波器的特性
3. 体会电路参数匹配的重要性

= 实验原理

== 函数发生器

函数发生器是一种能产生多种标准波形(如正弦波、方波、三角波等)的电子仪器,其核心原理是通过电路合成或直接生成周期性电信号,具体可分为直接合成法和间接合成法.

直接合成法是利用高精度晶体振荡器产生稳定基准频率,再通过分频、倍频、混频等电路对基准频率进行数学运算,直接合成所需频率和波形.间接合成法是通过积分电路对矩形脉冲积分先产生三角波再通过波形变换电路得到所需的波形

== 示波器
示波器是一种用于测量和显示电信号的仪器,其核心原理是通过将输入的电信号转换为电压信号,再通过垂直和水平轴上的坐标点进行显示.

#figure(
  image("image2-1.png", width: 30%),
  caption: [Lissajous图解相位差],
)<figure2-1>

如@figure2-1 所示, 将两个信号按照 $x$ 和 $y$ 两个方向输入,即可得到Lissajous 图,运用几何手段,得到：

#math.equation(
  $ Delta phi =arctan y_0/Y_m $,
  block:true,
  numbering: "(1)",
)<equ1>

= 实验内容

== RC电路正弦信号的测量和移相观测

=== 实验步骤

按照@figure2-2 连接电路图,函数信号发生器输出正弦信号$f$ =400Hz,$U_i$ =1.0V

1. 用示波器观察$u_i$,$u_o$,$u_R$的波形,测量幅值、频率
2. 用Y-T模式测$u_i$和$u_o$的相位差
3. 用李沙育图形测$u_i$和$u_o$的相位差

#figure(
  image("image2-2.png", width: 40%),
  caption: [实验1电路图],
)<figure2-2>

=== 实验结果

实验结果如@figure2-3 所示.信号$u_o$的幅值为0.875V,频率仍为400Hz.对于相位差,采取直接计算和Lissajous 图辅助计算相结合的方式.

#figure(
  image("image2-3.png", width: 65%),
  caption: [实验1结果图],
)<figure2-3>

直接计算表明,前后信号波峰相差200$mu$s,相位差为$360 times (200 times 10^(-6))/(1\/400) approx 28.8 degree$.

利用Lissajous 图计算,得到$y_0=430$,$Y_m=890$,根据@equ1 ,得到相位差为$arctan(430/890) approx 28.89 degree$.这两种计算方法得到的数据接近,应予采信.

=== 实验分析

当输入信号为正弦交流电压 $u_i = U_i sin (omega t)$ 时,电路最终会进入稳态.此时 RC 电路常作为 “分压器”,电容两端的电压 $U_C$ 是输入电压 $U_i$ 的一部分,其规律由容抗和阻抗分压决定.

容抗与频率成反比:
#math.equation(
  $ X_C = 1/(2 pi f C) = 1/(omega C) $,
  block:true,
  numbering: "(1)",
)<equ2>

根据分压原理,电容两端电压的幅值为：
#math.equation(
  $ U_C = U_i / sqrt(1 + (omega R C)²) $,
  block:true,
  numbering: "(1)",
)<equ3>

电容两端电压与输入电压的相位差为:

#math.equation(
  $ phi = -arctan(omega R C) $,
  block:true,
  numbering: "(1)",
)<equ4>

== 方波信号与RC电路响应的观测 <32>

=== 实验步骤

按照@figure2-4 连接电路图.输入方波信号,VPP=5.0V,$f$=1.0kHz,观察并记录改变电容电阻时的输入、输出波形：

#figure(
  image("image-1.png", width: 80%),
  caption: [实验2电路图],
)<figure2-4>

=== 实验结果

如@biao1 所示
#show table: three-line-table 
#figure(
  table(
      columns: 5,
      [序号],[电路类型], [电阻(单位k$Omega$)], [电容(单位$mu$F)], [图样],
      [1],[微分], [1], [0.01],[@figure2-5 左上],
      [2],[微分], [20], [0.1], [@figure2-5 右上],
      [3],[积分], [5.1], [0.01], [@figure2-5 左下],
      [4],[积分],[20],[0.1],[@figure2-5 右下]
),
  caption: [@32 实验数据]
)<biao1>


#figure(
  image("image-2.png", width: 100%),
  caption: [实验2结果图],
)<figure2-5>

=== 实验分析

微分电路和积分电路均为RC串联结构,核心差异体现在输出端选择与时间常数$tau = R C$和输入信号脉宽$T$的比例关系上,二者分别利用电容特性提取信号的变化率与累积量。

微分电路从电阻R取输出需满足时间常数远小于脉宽.方波上升沿电容电压不能突变,输入电压全加在电阻上形成正向尖峰；平顶期电容瞬间充满,电阻无电压输出为0;下降沿时电容放电,电阻产生负向尖峰,最终输出对应信号突变的正负尖脉冲,其数学关系近似为$ U_0 approx R C (d u)/(d t) $
实现对输入信号变化率的提取,常用于脉冲整形与触发信号提取。


积分电路从电容C取输出(U₀=U_C),需满足时间常数远大于脉宽.方波上升沿时,电容因时间常数极大而缓慢充电,输出电压近似线性上升；下降沿时电容缓慢放电,输出线性下降；持续输入则形成三角波或锯齿波,数学关系近似为$ U_0 approx (1/(R C)) integral_0^T u_i (t) d t $
实现对输入信号累积量的提取,常用于波形转换与模拟信号累积计算。

@biao1 所示的实验2和3,均体现为提前达到峰值,这体现出分电压不能大于总电压的规律.

== RC电路的频率特性 <33>

=== 实验步骤

按照@figure2-6 连接电路图,输入正弦信号,$U_i$=5V,$f$=100Hz\~500kHz.

#figure(
  image("image-3.png", width: 80%),
  caption: [实验3电路图],
)<figure2-6>

=== 实验结果

如@biao2 所示.

#figure(
  table(
      columns: 5,
      [频率(Hz)],[频率对数],[$U_i$(V)], [$U_o$(mV)], [电压倍数], 
      [100],[2],[5],[20.8],[0.00416],
      [200],[2.3010],[5],[56],[0.0112],
      [1000],[3],[5],[316],[0.0632],
      [5000],[3.6990],[5],[1480],[0.296],
      [10000],[4],[5],[2600],[0.52],
      [100000],[5],[5],[4640],[0.928],
      [500000],[5.6990],[5],[4800],[0.96],
),
  caption: [@33 实验数据一]
)<biao2>

#figure(
  table(
      columns: 5,
      [频率(Hz)],[频率对数],[$U_i$(V)], [$U_o$(mV)], [电压倍数], 
[100],[2],[5],[4880],[0.976],[1000],[3],[5],[4920],[0.984],[5000],[3.6990],[5],[4640],[0.928],[10000],[4],[5],[4080],[0.816],[100000],[5],[5],[736],[0.1472],[500000],[5.6990],[5],[208],[0.0416],
),
  caption: [@33 实验数据二]
)<biao3>

=== 实验分析

先将@biao3 所示数据进行绘图,得到@figure2-7. 鉴于@biao2 所示电路情形和@biao3 情形互补,因此只需验证前者是否拟合于理论@equ3.

对@equ3 加以变形,得到适合于本情形的表达式:

#math.equation(
  $ A=1/ sqrt(1 + ((2 pi times 10^(-5))/10^f)^2) $,
  block:true,
  numbering: "(1)",
)<equ5>

@figure2-7 所示数据与@equ5 拟合较好,验证了@equ3 的正确性.

#figure(
  image("image-4.png", width: 110%),
  caption: [实验3数据分析图],
)<figure2-7>

= 实验总结

本次实验验证了关于RC电路的频率特性,并且熟练了示波器、函数发生器等设备和面包板的使用.

本报告的撰写使用Typst排版.部分电路图使用Tikz绘制.
