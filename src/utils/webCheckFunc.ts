// 外部URLの正規表現
const EXTERNAL_URL_REGEX = /^https?:\/\/(?!www\.shizensyokuhin\.jp)(?!shizensyokuhin\.jp)(?!www\.s-shizensyokuhin\.jp)(?!s-shizensyokuhin\.jp)/;

// IDをエスケープする関数
function escapeId(id) {
    return id
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .substring(0, 50);
}

// メール用の申込番号の確認
function checkMailApplicationNo(pageSource) {
    const applicationNo = localStorage.getItem('applicationNo');
    const pattern = new RegExp(`SET @application_no = '${applicationNo}'`);
    return pattern.test(pageSource) ? null : '・冒頭変数または申込番号に誤りがあります';
}

// Web用の申込番号の確認
function checkWebApplicationNo(pageSource) {
    const applicationNo = localStorage.getItem('applicationNo');
    const pattern = new RegExp(`SET @application_no = '`);
    return !pattern.test(pageSource) ? null : '・冒頭変数を削除してください';
}

// ページタイトルの確認
function checkPageTitle(pageSource) {
    const title = localStorage.getItem('title');
    const pattern = new RegExp(`<title>${title}</title>`, 'i');
    const titleMatch = pageSource.match(/<title>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : '';


    console.log('設定されたタイトル:', title);
    console.log('ページタイトル:', pageTitle);


    return title === pageTitle ? null : '・タイトルに誤りがあります';
}

// 画像のリンク切れの確認
function checkImageLinks(pageSource) {
    return new Promise((resolve) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(pageSource, 'text/html');
        const images = doc.querySelectorAll('img');
        const errors = [];
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

            // 外部URLのチェックを含めた画像のリンク切れチェック
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

            // 外部URLのチェックを行う
            if (EXTERNAL_URL_REGEX.test(src)) {
                // 外部URLの場合でもリンク切れチェックを行う
                fetch(src, { method: 'HEAD' })
                    .then(response => {
                        if (!response.ok) {
                            errors.push(`・画像${index + 1}（URL: ${src}）がリンク切れです。`);
                        }
                    })
                    .catch(() => {
                        errors.push(`・画像${index + 1}（URL: ${src}）がリンク切れです。`);
                    })
                    .finally(() => {
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
function checkUTMCampaign(pageSource) {
    const pattern = /\$\$\$utm_campaign\$\$\$/;
    return pattern.test(pageSource) ? '・$$$utm_campaign$$$が存在します' : null;
}

// 特殊テキストの確認
const SPECIAL_TEXT = '※画像が';
function checkForSpecialText(pageSource) {
    const isMail = ELEMENTS.mailOption.checked;
    const textPattern = new RegExp(SPECIAL_TEXT, 'i'); // 大文字・小文字を区別しない
    const textExists = textPattern.test(pageSource);

    // 部分一致で判定
    return isMail
        ? textExists ? null : `・※画像がうまく表示されない方はこちらを追加してください`
        : textExists ? `・※画像がうまく表示されない方はこちらは削除してください` : null;
}


// noindexメタタグの確認
function checkNoIndexMetaTag(pageSource) {
    // コメントを取り除く正規表現
    const stripCommentsPattern = /<!--[\s\S]*?-->/g;

    // コメントを取り除いたソースコード
    const cleanedSource = pageSource.replace(stripCommentsPattern, '');

    // コメント外に存在するmetaタグの正規表現
    const metaPattern = /<meta\s+name=["']robots["']\s+content=["']noindex["']/i;

    // コメント外にnoindexメタタグが存在するかどうかをチェック
    return metaPattern.test(cleanedSource)
        ? null
        : '・noindexの記述がありません';
}

// 開封タグの確認
function checkNoIndexOpenTag(pageSource) {
    const isMail = ELEMENTS.mailOption.checked;

    // 正規化された開封タグのパターン（コメントアウトも含む）
    const openTagPattern = /<!--\s*<custom\s+name=["']opencounter["']\s+type=["']tracking["']\s*(\/?)>\s*-->|<custom\s+name=["']opencounter["']\s+type=["']tracking["']\s*(\/?)>/i;

    // <body> タグのパターン、属性を含む可能性に対応
    const bodyTagPattern = /<!--[\s\S]*?<\/body>|<body[^>]*>/i;

    if (isMail) {
        // メール版では <body> タグの直下に <custom name="opencounter" type="tracking" /> が必要
        const bodyTagMatch = pageSource.match(bodyTagPattern);
        if (bodyTagMatch) {
            const bodyTagIndex = bodyTagMatch.index + bodyTagMatch[0].length;
            const bodyContentAfterTag = pageSource.substring(bodyTagIndex);

            // コメントアウトされたタグも含めて、<body> タグの直下に開封タグがあるか確認
            if (!/<custom\s+name=["']opencounter["']\s+type=["']tracking["']\s*(\/?)>/.test(bodyContentAfterTag.replace(/<!--[\s\S]*?-->/g, ''))) {
                return '・開封タグの位置を確認してください';
            }
        } else {
            return '・<body> タグが存在しません';
        }
    } else {
        if (openTagPattern.test(pageSource)) {
            return '・開封タグは削除してください';
        }
    }

    return null;
}


// フッターの変数化チェック
function checkFooter(pageSource) {
    const isMail = ELEMENTS.mailOption.checked;
    const footerPatternMail = /お問い合わせは%%=TreatAsContent\(@contactlink\)=%%からお願いします。/;
    const footerPatternWeb = /お問い合わせは<a href="https:\/\/www\.shizensyokuhin\.jp\/contact\/">こちら<\/a>からお願いします。/;

    if (isMail) {
        if (footerPatternMail.test(pageSource)) {
            return null;
        } else if (footerPatternWeb.test(pageSource)) {
            return '・フッター変数が変数化されていません';
        }
    } else {
        if (footerPatternWeb.test(pageSource)) {
            return null;
        } else if (footerPatternMail.test(pageSource)) {
            return '・フッター変数が解除されていません';
        }
    }

    return null;
}

// Google Tag Manager のチェック
function checkGTM(pageSource) {
    const bodyCloseTagPattern = /<\/body>/i;
    const gtmTagPattern = /<!--\s*Google Tag Manager\s*-->/i;

    // </body> タグの位置を見つける
    const bodyCloseTagMatch = pageSource.match(bodyCloseTagPattern);
    if (!bodyCloseTagMatch) {
        return '・</body> タグが存在しません';
    }

    const bodyCloseTagIndex = bodyCloseTagMatch.index;
    const bodyContentBeforeCloseTag = pageSource.substring(0, bodyCloseTagIndex);

    // Google Tag Manager タグが </body> タグより上にあるかどうかを確認
    if (gtmTagPattern.test(bodyContentBeforeCloseTag)) {
        return null; // GTM タグが正しい位置にある
    } else {
        return '・GTMの場所を確認してください';
    }
}

// メール用のプリヘッダーの確認
function checkMailPreheader(pageSource) {
    // id="preheader" を持つタグの存在をチェック
    const preheaderIdPattern = /id\s*=\s*["']preheader["']/i;
    if (!preheaderIdPattern.test(pageSource)) {
        return 'id="preheader"を追加してください。';
    }

    // id="preheader" を持つタグ内の文字列を抽出
    const preheaderTagPattern = /id\s*=\s*["']preheader["'][^>]*>([^<]*)<\/[^>]+>/i;
    const match = pageSource.match(preheaderTagPattern);
    const preheaderTagText = match ? match[1].trim() : '';

    // ユーザーが設定したプリヘッダーの値を取得
    let setPreheaderText = localStorage.getItem('preheader');
    if (setPreheaderText) {
        setPreheaderText = setPreheaderText.trim();
        // タグ内のテキストとユーザー設定のプリヘッダーを比較
        return preheaderTagText === setPreheaderText
            ? null // 成功時は `null` を返す
            : 'プリヘッダーを確認してください。'; // エラーメッセージを返す
    } else {
        return 'プリヘッダーが設定されていません'; // `null` または空の場合のエラーメッセージ
    }
}

// Web用のプリヘッダーの確認
function checkWebPreheader(pageSource) {
    const preheaderPattern = /<!--\s*▼\s*プリヘッダー\s*▼\s*-->/i;
    return preheaderPattern.test(pageSource) ? '・プリヘッダーを削除してください' : null;
}

// ファビコンのチェック
function checkFavicon(pageSource) {
    const isSEAC = document.getElementById('seacOption').checked;

    // 通常のファビコンのパターン
    const faviconPattern = isSEAC
        ? /<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/seac\/img\/common\/favicon\.ico["']\s*\/?>/i
        : /<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/favicon\.ico["']\s*\/?>/i;

    // コメントアウトされたファビコンのパターン
    const commentedFaviconPattern = isSEAC
        ? /<!--.*?<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/seac\/img\/common\/favicon\.ico["']\s*\/?>.*?-->/i
        : /<!--.*?<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/favicon\.ico["']\s*\/?>.*?-->/i;

    // 通常のファビコンが存在するかチェック
    const hasFavicon = faviconPattern.test(pageSource);
    // コメントアウトされたファビコンが存在するかチェック
    const hasCommentedFavicon = commentedFaviconPattern.test(pageSource);

    // ファビコンが存在しない、またはコメントアウトされている場合にエラーを返す
    if (!hasFavicon || hasCommentedFavicon) {
        return '・faviconの記述を確認してください';
    }

    return null;
}