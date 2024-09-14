# CommandList
ex0ch掲示板で有効なコマンドの一覧を表示します
## 使い方
スクリプト側での記述例
```
my $bbs_com = $Set->Get('BBS_COMMAND');
my $bbs_title = $Set->Get('BBS_TITLE');
my $bbs_ninja = $Set->Get('BBS_NINJA');
my $commandListUrl = "./list/?command=$bbs_com&title=$bbs_title&is_ninja=$bbs_ninja";
```
アクセスURL例  
```https://example.com/list/?command=2047&title=実況掲示板&is_ninja=checked```
