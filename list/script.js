async function get_param() {
    const url_params = new URLSearchParams(window.location.search);
    const command_value = url_params.get('command');
    const is_ninja = url_params.get('is_ninja');
    const bbs_title = url_params.get('title');

    if (!command_value) {
        console.error('URLパラメータが不足しています');
        return;
    } else {
        display_bitmask(command_value, is_ninja);
    }

    if (bbs_title !== null) {
        document.getElementById('title').textContent = `${bbs_title}`;  // 安全に処理
    }
}

const bit_descriptions = {
    0: { name: "スレッドパスワード(!pass)",location: "メール欄", timing: "スレ立て時・スレ中コマンド使用時",
    description: "スレ立て時にスレッドにパスワードを設定することで、スレッド中でもコマンドを使えるようにします",example: "!pass:g56e*eASqr" },
    1: { name: "最大レス数(!maxres)",location: "本文", timing: "スレ立て時",
    description: "スレッドの最大レス数を100~2000の間で変更します",example: "!maxres:1500" },
    2: { name: "強制下げ(!sage)",location: "本文", timing: "いつでも",
    description: "スレッドを強制sageにします",example: "!sage" },
    3: { name: "ID無し(!noid)",location: "本文", timing: "いつでも",
    description: "スレッドをID無しにします",example: "!noid" },
    4: { name: "ID変更(!changeid)",location: "本文", timing: "いつでも",
    description: "IDをスレッド独自のものにします",example: "!changeid" },
    5: { name: "名無し強制(!force774)",location: "本文", timing: "いつでも",
    description: "名前を強制的にデフォルトにします",example: "!force774" },
    6: { name: "名無し変更(!change774)",location: "本文", timing: "いつでも",
    description: "デフォルト名無しをスレッド独自のものにします",example: "!change774:風吹けば名無し" },
    7: { name: "スレスト(!stop)",location: "本文", timing: "書き込み時",
    description: "スレッドを停止します",example: "!stop" },
    8: { name: "コマンド取り消し(!delcmd)",location: "本文", timing: "書き込み時",
    description: "コマンドを取り消します<br>1書き込みで1つ取り消せます",example: "!delcmd:change774" },
    9: { name: "過去ログ送り(!pool)",location: "本文", timing: "書き込み時",
    description: "スレッドを過去ログに送ります",example: "!pool" },
    10: { name: "実況モード(!live)",location: "本文", timing: "いつでも",
    description: "一時間以上書き込みがないと、スレッドが過去ログに送られるようにします",example: "!live" },
    11: { name: "BBS_SLIP(!slip)",location: "本文", timing: "いつでも",
    description: "ワッチョイやKOROKOROを表示させます<br>vvv:ワッチョイ<br>vvvv:ワッチョイ+IP<br>vvvvv:ワッチョイ+KOROKORO<br>vvvvvv:ワッチョイ+KOROKORO+IP",example: "!slip:vvvvv" },
    12: { name: "アクセス禁止(!ban)",location: "本文", timing: "書き込み時",
    description: "対象のユーザーをスレッドからBANします",example: "!ban:>>5" },
    13: { name: "忍法帖レベル制限(!ninlv)",location: "本文", timing: "いつでも",
    description: "忍法帖が設定されている場合、指定レベル未満の書き込みを制限します",example: "!ninlv:10" },
    14: { name: "スレタイ変更(!changetitle)",location: "本文", timing: "いつでも",
    description: "スレタイを変更します",example: "!changetitle:今日の晩飯が茗荷二個なんだが" },
    15: { name: "スレ主表示なし(!hidenusi)",location: "本文", timing: "いつでも",
    description: "スレ主のIDの末尾に表示される(主)表記を消します",example: "!hidenusi" },
    16: { name: "追記(!add)",location: "本文", timing: "スレ立て時",
    description: "自分のレスに追記できます",example: "!add:>>407:これリンク切れ" },
    17: { name: "強制age(!float)",location: "本文", timing: "いつでも",
    description: "スレッドが下がらなくなります",example: "!float" },
    18: { name: "不落(!nopool)",location: "本文", timing: "いつでも",
    description: "スレがDat落ちしにくくなります",example: "!nopool" },
    19: { name: "レス削除(!delete)",location: "本文", timing: "書き込み時",
    description: "指定したレスを削除できます",example: "!delete:>>98" },
    20: { name: "extend(!extend)",location: "本文一行目", timing: "スレ立て時",
    description: "5ch互換用のコマンドです",example: "!extend:on:vvvvvv:1000:512" },
    21: { name: "副主(!sub)",location: "本文", timing: "書き込み時",
    description: "スレッドに副主を設定します",example: "!sub:>>5" },
    22: { name: "BAN投票(!vote)",location: "本文", timing: "書き込み時",
    description: "対象となるユーザにBAN投票します<br>スレ主・副主以外も使用可能 (レベル制限がかかっている場合、その影響を受ける)",example: "!vote:>>512" },
    23: { name: "スレッド属性引き継ぎ(!loadattr)",location: "本文一行目", timing: "スレ立て時",
    description: "対象のスレッドの属性を引き継いでスレ立てをします<br>スレッドIDで引き継ぎ元を指定してください",example: "!loadattr:1697985000" },
    // 他の項目についてもここに追加
    //template
    //1: { name: "(!)",location: "本文", timing: "スレ立て時",
    //description: "",example: "!" },
};

function display_bitmask(value, ninja) {
    let result_text = '<h3>コマンド一覧</h3><br>';
    const bit_keys = Object.keys(bit_descriptions);
    for (let i of bit_keys) {
        const mask = 1 << parseInt(i, 10);  // 確実に整数に変換
        const is_on = (value & mask) !== 0;
        const bit_info = bit_descriptions[i];
        let item_class = is_on ? 'setting-item' : 'setting-item setting-item-off';
        let status_class = is_on ? '' : 'setting-status-off';
        let need_pass_set = is_on ? '使用可' : '使用不可';

        if (i == 13 && !ninja) {
            item_class = 'setting-item setting-item-off';
            status_class = 'setting-status-off';
            need_pass_set = '忍法帖無効のため使用不可';
        }

        result_text += `
            <div class="${item_class}">
                <div class="setting-name">${bit_info.name}</div>
                <div class="setting-status ${status_class}"><span>${need_pass_set}</span></div>
                <div class="setting-location">記述場所: ${bit_info.location}</div>
                <div class="setting-timing">記述タイミング: ${bit_info.timing}</div>
                <hr>
                <div class="setting-description">説明: ${bit_info.description}</div>
                <div class="setting-example">例: ${bit_info.example}</div>
            </div>`;
    }
    document.getElementById('result').innerHTML = result_text;
}

document.addEventListener('DOMContentLoaded', (event) => {
    get_param();
});
