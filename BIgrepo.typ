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
  v(1.3fr)
}

// // 使用自定义封面
// #custom-title-page()

// #custom-title-page-author()

// #pagebreak()

#show: project.with(
  title: "直流稳压电源 集合论文",
  date: auto,
  abstract: [待定],
  keywords: [待定],
)

= 数字电路部分

== TLP5615 数字-模拟转换模块

