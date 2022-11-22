# 代码提交规范

## 提交信息规范

- 提交格式为：`<type>(<scope>): <subject>`
  - type （必需）用于说明 commit 的类别，有以下7个标识
    - feat：新功能（feature）
    - fix：修补bug
    - docs：文档（documentation）
    - perf：优化相关，比如提升性能、体验
    - style： 格式（不影响代码运行的变动）
    - refactor：重构（即不是新增功能，也不是修改bug的代码变动）
    - test：增加测试
    - chore：构建过程或辅助工具的变动
  - scope （可选）用于说明 commit 影响的范围，比如数w据层、控制层、视图层等等，视项目不同而不同
  - subject（必需）是 commit 目的的简短描述，不超过50个字符
    - 以动词开头，使用第一人称现在时，比如change，而不是changed或changes
    - 第一个字母小写
    - 结尾不加句号（.）
