#import "lib.typ": *

#set footnote(numbering: (..args) => {
  args.pos().at(0) * "†"
})

#let custom-title-page() = {
  set align(center)
  set block(width: 100%, height: 100%)
  set text(weight: "regular", size: 55pt, font: "STZhongSong")
  
  v(1fr)
  [实验报告]
  // v(2fr)
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
  title: "电路带载能力的探究",
  date: auto,
  abstract: [本实验以电路带载能力及集成运放电路工作特性为研究对象，通过理论分析与实验测试相结合的方式展开探究。测试结果表明，随着负载电阻增大，路端电压呈反比例函数变化趋势，符合欧姆定律推导规律。集成运放电路实验显示，负反馈状态下运放呈现电压跟随器特性，可维持输出电压稳定，显著提升电路带载能力；无反馈时则处于开环状态，输出电压趋近电源电压。在正相、反相比例放大电路中，电压放大倍数与输入电阻的关系基本符合理论公式，但受电源电压限制，输出电压无法超过阈值。#footnote[合作者:金鼎哲]],
  keywords: ("电路带载能力", "集成运放电路")
)

// 正文内容可以从这里开始
#heading(level:1)[实验目的]
#set par(hanging-indent: 2em, first-line-indent: 2em)

1. 学习和掌握直流稳压电源、数字万用表的使用
2. 学习电路构成的基本方法,学会连接实验电路
3. 熟悉和掌握有源电路输出特性(伏安特性)的测试
4. 探究电路的带载能力
5. 探究集成运放电路的工作特性

#heading(level:1)[实验原理]
#set par(hanging-indent: 0em, first-line-indent: 2em)
本次实验主要围绕电路带载能力展开探究。电路带载能力是指电路在接入不同负载时,维持输出电压稳定的能力。当负载电阻变化时,根据欧姆定律：

#math.equation(
  $I=U/R$,
  block: true,
  numbering: "(1)",
)<equation1>
这导致输出电压出现波动。

后续实验中使用含运放的电路,利用运放的“虚短”和“虚断”特性,能在一定程度上稳定输出电压,提高电路的带载能力。
#set text(font: "SimSun",weight: "bold")

*在一定的工作区间内*,运放工作在负反馈状态时反相比例放大、同相比例放大下的电压放大倍数$A$和外部电阻和反馈电阻有关。不妨设外部电阻中输入电阻为$R_1$,反馈电阻为$R_F$,在反相下有:

#math.equation(
  $A=-R_F/R_1$,
  block: true,
  numbering: "(1)",
)<equation2>

在同相下有：
#math.equation(
  $A=1+R_F/R_1$,
  block: true,
  numbering: "(1)",
)<equation3>
通过合理选择$R_1$和$R_F$的数值,即可获得所需的放大倍数。

= 实验内容
== 电路输出特性 <311>
=== 实验电路图
#figure(
  image("image.png", width: 40%),
  caption: [实验1电路图],
)<figure1>
=== 实验步骤
#set par(hanging-indent: 0em, first-line-indent: 2em)
按照@figure1 所示电路图接线$2V$,选择$1k Omega—10k Omega$范围内的不同负载电阻，用数字万用表观察不同负载时的输出电压,结果如@biao1 所示。
=== 实验结果
#show table: three-line-table 

#figure(
  table(
      columns: 4,
      [负载电阻], [路端电压], [负载电阻],[路段电压],
      [0$k Omega$], [0.256mV], [1$k Omega$], [1.69V],
      [2$k Omega$], [1.83V], [3$k Omega$], [1.88V],
      [4$k Omega$], [1.91V], [5$k Omega$], [1.93V],
      [6$k Omega$], [1.94V], [7$k Omega$], [1.95V],
      [8$k Omega$], [1.95mV], [9$k Omega$], [1.96mV],
      [10$k Omega$], [1.96mV],
  ),
  caption: [@311 实验数据]
)<biao1>

=== 实验分析
#set par(hanging-indent: 0em, first-line-indent: 2em)
根据欧姆定律,有
#math.equation(
  $ I=U/(r+5100+k times 10000) $,
  block: true,
  numbering: "(1)",
)<equation4>
由数据不难发现,随着负载电阻的增大,路端电压呈现反比例函数变化趋势,与@equation4 基本吻合

== 集成运放电路特性I <312>

=== 实验电路图
#figure(
  image("image2.png", width: 70%),
  caption: [实验2电路图],
)<figure2>

=== 实验步骤

#set par(hanging-indent: 0em, first-line-indent: 2em)
按照@figure2 接线。
1. 电源与电位器状态与@311 相同，选择相同的负载电阻，观察不同负载时的输出电压\
2. 改变运放输入电压测量输出电压\
3. 断开运放的反馈，测量输出电压\
相关结果如@biao2 所示。
=== 实验结果
#show table: three-line-table 

#figure(
  table(
      columns: 3,
      [输入电压], [连接反馈], [断开反馈],
      [1V], [1.00245V], [10.9082V],
      [2V], [2.00387V], [10.9122V], 
      [3V], [3.00288V], [10.9254V], 
),
  caption: [@312 实验数据]
)<biao2>

=== 实验分析

#set par(hanging-indent: 0em, first-line-indent: 2em)
当电路连接了反馈端时,输出的电压基本和原电压一致,这说明运放在负反馈状态下,呈现出电压跟随器的性质,能保持输出电压的稳定性。

当电路断开了反馈端时,输出电压会稳定在一个较大的数值,这说明运放在无反馈状态下,体现为开环控制,输出电压会向给运放供电的电源电压($12V$)接近。

== 集成运放电路特性II <313>

=== 实验电路图

#figure(
  image("image3.png", width: 70%),
  caption: [实验3电路图],
)<figure3>

#figure(
  image("image4.png", width: 50%),
  caption: [实验4电路图],
)<figure4>

=== 实验步骤

#set par(hanging-indent: 0em, first-line-indent: 2em)
按照@figure3 和@figure4 接线,计算电压放大倍数

$
A=U_o/U_i
$

分析$A$和$R_1$、$R_F$的关系,具体实验数据如@biao3 和@biao4 所示。

=== 实验结果


#figure(
  table(
      columns: 12,
      [输入], [输出], [$R_1$], [$R_F$], [输入], [输出], [$R_1$], [$R_F$], [输入], [输出], [$R_1$], [$R_F$], 
      [2.07V], [6.25V], [1$k Omega$],[20$k Omega$],
      [2.07V], [10.29V], [5.1$k Omega$], [20$k Omega$],
      [2.07V], [10.79V], [10$k Omega$], [20$k Omega$],
      [2.07V], [10.74V], [1$k Omega$],[10$k Omega$],
      [2.07V], [6.17V], [5.1$k Omega$], [10$k Omega$],
      [2.07V], [4.15V], [10$k Omega$], [10$k Omega$],
      [2.07V], [10.68V], [1$k Omega$],[5.1$k Omega$],
      [2.07V], [4.14V], [5.1$k Omega$], [5.1$k Omega$],
      [2.07V], [3.63V], [10$k Omega$], [5.1$k Omega$],

),
  caption: [@313 实验数据(正相)]
)<biao3>

#figure(
  table(
      columns: 8,
      [输入], [输出], [$R_1$], [$R_F$], [输入], [输出], [$R_1$], [$R_F$], 
      [1.71V], [-1.89V], [20$k Omega$],[20$k Omega$],
      [1.71V], [-0.88V], [5.1$k Omega$],[10$k Omega$],
      [1.71V], [-3.4V], [20$k Omega$], [10$k Omega$],
      [1.47V], [-0.58V], [2$k Omega$],[5.1$k Omega$],
      [1.47V], [-1.47V], [5.1$k Omega$], [5.1$k Omega$],
      [1.47V], [-5.8V], [20$k Omega$], [5.1$k Omega$],

),
  caption: [@313 实验数据(正相)]
)<biao4>

=== 实验分析
#set par(hanging-indent: 0em, first-line-indent: 2em)
分析结果,*在一定的工作范围内*,基本和@equation1 和@equation2 所示规律一致。当预期放大电压大于集成运放的输入($12V$)时,增速明显放缓,无法越过这个值。

= 实验总结


通过本次实验，我对电路的基本特性及运放的工作原理有了更深入的理解，也在实践操作中提升了动手能力和问题分析能力。

此次实验让我深刻认识到理论与实践相结合的重要性。课本上的公式和原理只有在亲
手操作中才能真正理解其内涵，实验中观察到的现象也进一步巩固了理论知识。

本报告的撰写使用了新排版手段,为接下来的报告撰写提供预训练。 #footnote[本文使用Typst排版,因而视觉上不同于word引出的PDF]