# dokai/dokai/ 旧副本的 xlsx（保存用）

optimize 分支删除了未被任何页面引用的旧副本目录 `dokai/dokai/`。其中 6 个 xlsx 与正式目录
`dokai/Nk/homework/N.xlsx` 的文件 blob 不同，为了不丢数据，原样（从 main 分支 fd70462）保存在这里。

| 文件 | 原路径 | 对应正式文件 |
|---|---|---|
| 8.xlsx  | dokai/dokai/8k/homework/8.xlsx   | dokai/8k/homework/8.xlsx |
| 9.xlsx  | dokai/dokai/9k/homework/9.xlsx   | dokai/9k/homework/9.xlsx |
| 10.xlsx | dokai/dokai/10k/homework/10.xlsx | dokai/10k/homework/10.xlsx |
| 11.xlsx | dokai/dokai/11k/homework/11.xlsx | dokai/11k/homework/11.xlsx |
| 12.xlsx | dokai/dokai/12k/homework/12.xlsx | dokai/12k/homework/12.xlsx |
| 13.xlsx | dokai/dokai/13k/homework/13.xlsx | dokai/13k/homework/13.xlsx |

比较结果（2026-10-23）：解压后逐个 XML 比较，工作表、样式、共享字符串等**全部字节一致**，
所有单元格的值也一致。唯一的差别是 `customXml/itemProps1～3.xml` 里的 `ds:itemID`（GUID），
这是 OneDrive／SharePoint 保存时自动写入的元数据，不影响内容。

所以实质上与正式版相同；仍按原样保留，老师确认不需要后可以删除本目录。
页面不引用这些文件，学生看不到。
