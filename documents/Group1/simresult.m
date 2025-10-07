x = [1,5,10,15,20,25,30,35,40,45,50,55,60,70,80,90,99];
y = [1.512,2.562,3.874,5.185,6.495,7.805,9.113,10.421,10.782,10.786,10.788,10.79,10.792,10.795,10.798,10.8,10.801];
figure;
% 实心红点并添加连接线（'ro-'中'-'表示连接线）
plot(x, y, 'ro', 'MarkerSize', 6, 'LineWidth', 1.5, 'MarkerFaceColor', 'r');
hold on;
x_line = linspace(min(x), 40, 100);
y_line = 1.25 + (50 *1.25* x_line) / 240;
plot(x_line, y_line, 'b-', 'LineWidth', 2);
grid on;
xlabel('滑动变阻器接入比例(%)', 'FontSize', 12);
ylabel('输出电压U_o(V)', 'FontSize', 12);
title('输出电压变化图(输入电压U_i=12V)', 'FontSize', 14);
legend('数据点', '理论结果', 'Location', 'best');
xlim([min(x), max(x)+5]);
ylim([min([y, y_line])-0.5, max([y, y_line])]);