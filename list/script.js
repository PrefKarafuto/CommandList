async function readFile() {
    const urlParams = new URLSearchParams(window.location.search);
    const bbsname = urlParams.get('bbs');

    if (!bbsname) {
        console.error('掲示板がURLパラメータで指定されていません');
        return;
    }

    const filePath = `../${bbsname}/SETTING.TXT`;

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const text = new TextDecoder('shift_jis').decode(new Uint8Array(arrayBuffer));
            const lines = text.split('\n');
            let bbsCommandValue = null;
            let bbsTitle = null;

            for (let line of lines) {
                if (line.startsWith('BBS_COMMAND=')) {
                    bbsCommandValue = parseInt(line.split('=')[1], 10);
                } else if (line.startsWith('BBS_TITLE=')) {
                    bbsTitle = line.split('=')[1];
                }

                if (bbsCommandValue !== null && bbsTitle !== null) {
                    break;
                }
            }

            if (bbsCommandValue !== null) {
                displayBitmask(bbsCommandValue);
            }

            if (bbsTitle !== null) {
                document.getElementById('title').innerText = `${bbsTitle}`;
            }
        } else {
            console.error('ファイルの読み込みに失敗しました');
        }
    } catch (error) {
        console.error('エラー:', error);
    }
}

const bitDescriptions = {
    0: { name: "スレッドパスワード(!pass)",location: "メール欄", timing: "スレ立て時・スレ中コマンド使用時",
    description: "スレ立て時にスレッドにパスワードを設定することで、スレッド中でもコマンドを使えるようにします",example: "!pass:g56e*eASqr" },
    1: { name: "最大レス数(!maxres)",location: "本文", timing: "スレ立て時",
    description: "スレッドの最大レス数を100~2000の間で変更します",example: "!maxres:1500" },
    2: { name: "強制下げ(!sage)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "スレッドを強制sageにします",example: "!sage" },
    3: { name: "ID無し(!noid)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "スレッドをID無しにします",example: "!noid" },
    4: { name: "ID変更(!changeid)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "IDをスレッド独自のものにします",example: "!changeid" },
    5: { name: "名無し強制(!force774)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "名前を強制的にデフォルトにします",example: "!force774" },
    6: { name: "名無し変更(!change774)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "デフォルト名無しをスレッド独自のものにします",example: "!change774:風吹けば名無し" },
    7: { name: "スレスト(!stop)",location: "本文", timing: "スレッドpass設定時",
    description: "スレッドを停止します",example: "!stop" },
    8: { name: "コマンド取り消し(!delcmd)",location: "本文", timing: "スレッドpass設定時",
    description: "コマンドを取り消します<br>1書き込みで1つ取り消せます",example: "!delcmd:change774" },
    9: { name: "過去ログ送り(!pool)",location: "本文", timing: "スレッドpass設定時",
    description: "スレッドを過去ログに送ります",example: "!pool" },
    10: { name: "実況モード(!live)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "一時間以上書き込みがないと、スレッドが過去ログに送られるようにします",example: "!live" },
    11: { name: "BBS_SLIP(!slip)",location: "本文", timing: "スレ立て時・スレッドpass設定時",
    description: "ワッチョイやKOROKOROを表示させます<br>vvv:ワッチョイ<br>vvvv:ワッチョイ+IP<br>vvvvv:ワッチョイ+KOROKORO<br>vvvvvv:ワッチョイ+KOROKORO+IP",example: "!slip:vvvvv" },
    // 他のビットについてもここに追加
};

function displayBitmask(value) {
    let resultText = 'コマンド一覧<br>';
    const bitKeys = Object.keys(bitDescriptions);
    const isPassSet = (value & 1) !== 0; //passが設定可能か
    for (let i of bitKeys) {
        const mask = 1 << parseInt(i, 10);  // キーを明示的に数値に変換
        const isOn = (value & mask) !== 0;
        const bitInfo = bitDescriptions[i];
        const itemClass = isOn ? 'setting-item' : 'setting-item setting-item-off';
        const statusClass = isOn ? '' : 'setting-status-off';
        const needPassSet = isOn ? ((!isPassSet && i>=7 && i<=9) ? 'スレッドパスワード無効のため使用不可':'使用可') : '使用不可';
        resultText += `
            <div class="${itemClass}">
                <div class="setting-name">${bitInfo.name}</div>
                <div class="setting-status ${statusClass}"><span>${needPassSet}</span></div>
                <div class="setting-location">記述場所: ${bitInfo.location}</div>
                <div class="setting-timing">記述タイミング: ${bitInfo.timing}</div>
                <hr>
                <div class="setting-description">説明: ${bitInfo.description}</div>
                <div class="setting-example">例: ${bitInfo.example}</div>
            </div>`;
    }
    document.getElementById('result').innerHTML = resultText;
}

document.addEventListener('DOMContentLoaded', (event) => {
    readFile();
});
