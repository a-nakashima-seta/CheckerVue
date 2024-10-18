// IDをエスケープする関数
// function escapeId(id: string) {
//     return id
//         .toLowerCase()
//         .replace(/[^a-z0-9_-]/g, '')
//         .substring(0, 50);
// }

// ページタイトルの確認
function checkPageTitle(pageSource: string) {
    const title = localStorage.getItem('title');
    const titleMatch = pageSource.match(/<title>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : '';

    return title === pageTitle ? null : '・タイトルに誤りがあります';
}

// メール用のプリヘッダーの確認
function checkMailPreheader(pageSource: string) {
    const preheaderIdPattern = /id\s*=\s*["']preheader["']/i;
    if (!preheaderIdPattern.test(pageSource)) {
        return '・id="preheader"を追加してください。';
    }

    const preheaderTagPattern = /id\s*=\s*["']preheader["'][^>]*>([^<]*)<\/[^>]+>/i;
    const match = pageSource.match(preheaderTagPattern);
    const preheaderTagText = match ? match[1].trim() : '';

    let setPreheaderText = localStorage.getItem('preheader');
    if (setPreheaderText) {
        setPreheaderText = setPreheaderText.trim();
        return preheaderTagText === setPreheaderText
            ? null
            : '・プリヘッダーを確認してください。';
    } else {
        return '・プリヘッダーが設定されていません';
    }
}

// メール用の申込番号の確認
function checkMailApplicationNo(pageSource: string) {
    const applicationNo = localStorage.getItem('prod_cd');

    const pattern = new RegExp(`SET @application_no = '${applicationNo}'`);
    return pattern.test(pageSource) ? null : '・冒頭変数または申込番号に誤りがあります';
}


// 画像のリンク切れの確認
// 外部URLの正規表現
const EXTERNAL_URL_REGEX = /^https?:\/\/(?!www\.shizensyokuhin\.jp)(?!shizensyokuhin\.jp)(?!www\.s-shizensyokuhin\.jp)(?!s-shizensyokuhin\.jp)/;

function checkImageLinks(pageSource: string): Promise<string[]> {
    return new Promise((resolve) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(pageSource, 'text/html');
        const images = doc.querySelectorAll('img');
        const errors: Array<string> = [];
        const totalImages = images.length;
        let loadedImages = 0;

        if (totalImages === 0) {
            resolve(errors);
            return;
        }

        images.forEach((img, index) => {
            const src = img.getAttribute('src');
            if (!src) {
                errors.push(`・画像${index + 1}のsrc属性が空です。`);
                loadedImages++;
                if (loadedImages === totalImages) {
                    errors.sort();
                    resolve(errors);
                }
                return;
            }

            const imgElement = new Image();
            imgElement.src = src;
            imgElement.onload = () => {
                loadedImages++;
                if (loadedImages === totalImages) {
                    errors.sort();
                    resolve(errors);
                }
            };
            imgElement.onerror = () => {
                errors.push(`・画像${index + 1}（URL: ${src}）がリンク切れです。`);
                loadedImages++;
                if (loadedImages === totalImages) {
                    errors.sort();
                    resolve(errors);
                }
            };

            if (EXTERNAL_URL_REGEX.test(src)) {
                fetch(src, { method: 'HEAD' })
                    .then(response => {
                        if (!response.ok) {
                            errors.push(`・画像${index + 1}（URL: ${src}）がリンク切れです。`);
                        }
                    })
                    .then(() => {
                        loadedImages++;
                        if (loadedImages === totalImages) {
                            errors.sort();
                            resolve(errors);
                        }
                    });
            }
        });
    });
}

// $$$utm_campaign$$$の確認
function checkUTMCampaign(pageSource: string) {
    const pattern = /\$\$\$utm_campaign\$\$\$/;
    return pattern.test(pageSource) ? '・$$$utm_campaign$$$が存在します' : null;
}

// ※画像がうまく～の確認
const SPECIAL_TEXT = '※画像が';

function checkForSpecialText(pageSource: string) {
    const textPattern = new RegExp(SPECIAL_TEXT, 'i');
    const textExists = textPattern.test(pageSource);
    // 部分的な文字列が存在する場合にエラーメッセージを返す
    return !textExists ? '・"※画像がうまく表示されない方はこちら"を追加してください。' : null;
}


// 開封タグの確認
function checkNoIndexOpenTag(pageSource: string) {
    const bodyTagPattern = /<!--[\s\S]*?<\/body>|<body[^>]*>/i;

    const bodyTagMatch = pageSource.match(bodyTagPattern);
    if (bodyTagMatch) {
        const bodyTagIndex = bodyTagMatch.index + bodyTagMatch[0].length;
        const bodyContentAfterTag = pageSource.substring(bodyTagIndex);

        if (!/<custom\s+name=["']opencounter["']\s+type=["']tracking["']\s*(\/?)>/.test(bodyContentAfterTag.replace(/<!--[\s\S]*?-->/g, ''))) {
            return '・開封タグの位置を確認してください';
        }
    } else {
        return '・<body> タグが存在しません';
    }

    return null;
}

// フッターの変数化チェック
function checkFooter(pageSource: string) {
    const footerPatternMail = /お問い合わせは%%=TreatAsContent\(@contactlink\)=%%からお願いします。/;
    const footerPatternWeb = /お問い合わせは<a href="https:\/\/www\.shizensyokuhin\.jp\/contact\/">こちら<\/a>からお願いします。/;

    if (footerPatternMail.test(pageSource)) {
        return null;
    } else if (footerPatternWeb.test(pageSource)) {
        return '・フッター変数が変数化されていません';
    }

    return null;
}

export {
    checkPageTitle,
    checkMailPreheader,
    checkMailApplicationNo,
    checkImageLinks,
    checkUTMCampaign,
    checkForSpecialText,
    checkNoIndexOpenTag,
    checkFooter,
};
