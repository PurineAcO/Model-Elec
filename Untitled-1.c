#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

// 函数类型枚举
typedef enum {
    LINEAR,
    QUADRATIC,
    SINE,
    COSINE,
    EXPONENTIAL
} FunctionType;

// 函数参数结构体
typedef struct {
    FunctionType type;
    double a, b, c; // 系数，根据函数类型使用不同参数
    double x_start, x_end; // 定义域
} FunctionParams;

// 计算函数值
double compute_function(double x, FunctionParams params) {
    switch(params.type) {
        case LINEAR:
            return params.a * x + params.b;
        case QUADRATIC:
            return params.a * x * x + params.b * x + params.c;
        case SINE:
            return params.a * sin(params.b * x + params.c);
        case COSINE:
            return params.a * cos(params.b * x + params.c);
        case EXPONENTIAL:
            return params.a * exp(params.b * x);
        default:
            return 0.0;
    }
}

// 自适应采样函数，生成num_points个x点
int adaptive_sample(FunctionParams params, double *x_points, int num_points) {
    if (num_points < 2) return 0;

    // 初始点集：起点和终点
    double *points = (double *)malloc(2 * sizeof(double));
    points[0] = params.x_start;
    points[1] = params.x_end;
    int count = 2;

    // 迭代插入点，直到达到指定数量
    for (int i = 0; i < num_points - 2; i++) {
        int n_intervals = count - 1;
        double *curvatures = (double *)malloc(n_intervals * sizeof(double));
        double max_curvature = -1.0;
        int max_index = 0;

        // 计算每个区间的曲率
        for (int j = 0; j < n_intervals; j++) {
            double x0 = points[j];
            double x1 = points[j + 1];
            double xm = (x0 + x1) / 2.0; // 区间中点

            double f0 = compute_function(x0, params);
            double fm = compute_function(xm, params);
            double f1 = compute_function(x1, params);

            double h = xm - x0; // 半步长
            if (h == 0) {
                curvatures[j] = 0.0;
                continue;
            }

            // 用二阶差商近似曲率（二阶导数）
            double curvature = fabs(f0 - 2 * fm + f1) / (h * h);
            curvatures[j] = curvature;

            // 记录最大曲率的区间
            if (curvature > max_curvature) {
                max_curvature = curvature;
                max_index = j;
            }
        }

        // 在最大曲率区间插入中点
        double *new_points = (double *)malloc((count + 1) * sizeof(double));
        memcpy(new_points, points, (max_index + 1) * sizeof(double));
        new_points[max_index + 1] = (points[max_index] + points[max_index + 1]) / 2.0;
        memcpy(new_points + max_index + 2, points + max_index + 1, (count - max_index - 1) * sizeof(double));

        // 更新点集
        free(points);
        points = new_points;
        count++;

        free(curvatures);
    }

    // 将结果复制到输出数组
    memcpy(x_points, points, num_points * sizeof(double));
    free(points);

    return num_points;
}

int main() {
    FunctionParams params;
    int choice;

    printf("===== 函数数据点采样程序 =====\n");
    printf("请选择函数类型：\n");
    printf("1. 线性函数 (y = a*x + b)\n");
    printf("2. 二次函数 (y = a*x² + b*x + c)\n");
    printf("3. 正弦函数 (y = a*sin(b*x + c))\n");
    printf("4. 余弦函数 (y = a*cos(b*x + c))\n");
    printf("5. 指数函数 (y = a*exp(b*x))\n");
    printf("请输入选项 (1-5): ");
    scanf("%d", &choice);

    if (choice < 1 || choice > 5) {
        printf("无效的选项！\n");
        return 1;
    }
    params.type = choice - 1;

    // 输入函数参数
    switch(params.type) {
        case LINEAR:
            printf("请输入参数 a 和 b (用空格分隔): ");
            scanf("%lf %lf", &params.a, &params.b);
            break;
        case QUADRATIC:
            printf("请输入参数 a, b 和 c (用空格分隔): ");
            scanf("%lf %lf %lf", &params.a, &params.b, &params.c);
            break;
        case SINE:
            printf("请输入参数 a, b 和 c (用空格分隔): ");
            scanf("%lf %lf %lf", &params.a, &params.b, &params.c);
            break;
        case COSINE:
            printf("请输入参数 a, b 和 c (用空格分隔): ");
            scanf("%lf %lf %lf", &params.a, &params.b, &params.c);
            break;
        case EXPONENTIAL:
            printf("请输入参数 a 和 b (用空格分隔): ");
            scanf("%lf %lf", &params.a, &params.b);
            break;
    }

    // 输入定义域
    printf("请输入定义域 [x_start, x_end] (用空格分隔): ");
    scanf("%lf %lf", &params.x_start, &params.x_end);

    if (params.x_start >= params.x_end) {
        printf("错误：x_start 必须小于 x_end！\n");
        return 1;
    }

    // 生成100个自适应采样点
    double x_points[100];
    int num_points = adaptive_sample(params, x_points, 100);

    // 输出到文件和控制台
    FILE *fp = fopen("data_points.txt", "w");
    if (fp == NULL) {
        printf("无法打开文件 data_points.txt！\n");
        return 1;
    }

    printf("\n采样完成，共生成 %d 个数据点。结果已保存到 data_points.txt\n", num_points);
    printf("前5个数据点：\n");
    fprintf(fp, "x, y\n");

    for (int i = 0; i < num_points; i++) {
        double x = x_points[i];
        double y = compute_function(x, params);
        fprintf(fp, "%.6lf, %.6lf\n", x, y);

        // 打印前5个点
        if (i < 5) {
            printf("x=%.6lf, y=%.6lf\n", x, y);
        }
    }

    fclose(fp);
    return 0;
}
