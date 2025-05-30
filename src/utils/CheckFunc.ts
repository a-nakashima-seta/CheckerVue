import { DependentTexts } from "./DependentTexts";

// ページタイトルの確認
function checkPageTitle(pageSource: string) {
    const errors: string[] = [];
    const title = localStorage.getItem('title');
    const titleMatch = pageSource.match(/<title>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : '';

    if (title !== pageTitle) {
        errors.push('・タイトルに誤りがあります');
    }
    if (pageTitle.includes('<') || pageTitle.includes('>')) {
        errors.push('・タイトル内の半角文字<>を全角にしてください');
    }

    return errors.length > 0 ? errors.join('<br>') : null;
}

// メール用のプリヘッダーの確認
function checkMailPreheader(pageSource: string) {
    const errors: string[] = [];
    const preheaderIdPattern = /id\s*=\s*["']preheader["']/i;
    if (!preheaderIdPattern.test(pageSource)) {
        errors.push('・id="preheader"を追加してください。');
    }

    const preheaderTagPattern = /id\s*=\s*["']preheader["'][^>]*>([^<]*)<\/[^>]+>/i;
    const match = pageSource.match(preheaderTagPattern);
    const preheaderTagText = match ? match[1].trim() : '';

    let setPreheaderText = localStorage.getItem('preheader');
    if (setPreheaderText) {
        setPreheaderText = setPreheaderText.trim();
        if (preheaderTagText !== setPreheaderText) {
            errors.push('・プリヘッダーを確認してください。');
        }
    } else {
        errors.push('・プリヘッダーが設定されていません');
    }

    if (preheaderTagText.includes('<') || preheaderTagText.includes('>')) {
        errors.push('・プリヘッダー内の半角文字<>を全角にしてください');
    }

    return errors.length > 0 ? errors.join('<br>') : null;
}

// Web用のプリヘッダーの確認
function checkWebPreheader(pageSource: string) {
    const preheaderPattern = /<!--\s*▼\s*プリヘッダー\s*▼\s*-->/i;
    return preheaderPattern.test(pageSource) ? '・プリヘッダーを削除してください' : null;
}

// メール用の冒頭変数の確認
function checkMailApplicationNo(pageSource: string): string | null {
    const errors: string[] = [];
    const applicationNo = localStorage.getItem('prod_cd');

    const pattern = new RegExp(`SET @application_no = '${applicationNo}'`);
    if (!pattern.test(pageSource)) {
        errors.push('・冒頭変数または申込番号に誤りがあります');
    }

    const monthDeclarationPattern = /var\s+.*@Month/;
    const monthAssignmentPattern = /SET\s+@Month\s*=\s*FORMAT\(/;

    if (!monthDeclarationPattern.test(pageSource) && !monthAssignmentPattern.test(pageSource)) {
        errors.push('・冒頭変数内@Monthの記述に誤りがあります');
    }
    const unsublinkPattern = /SET\s+@unsublink\s*=\s*'<a\s+href="https:\/\/www\.shizensyokuhin\.jp\/howto\/012\.php">こちら<\/a>'/;
    const contactlinkPattern = /SET\s+@contactlink\s*=\s*'<a\s+href="https:\/\/www\.shizensyokuhin\.jp\/contact\/">こちら<\/a>'/;

    // コメントを取り除く正規表現
    const stripCommentsPattern = /<!--[\s\S]*?-->/g;
    const cleanedSource = pageSource.replace(stripCommentsPattern, '');

    if (!unsublinkPattern.test(cleanedSource)) {
        errors.push('・冒頭変数内@unsublinkの記述に誤りがあります');
    }

    if (!contactlinkPattern.test(cleanedSource)) {
        errors.push('・冒頭変数内@contactlinkの記述に誤りがあります');
    }

    return errors.length > 0 ? errors.join('<br>') : null;
}

// Web用の申込番号の確認
function checkWebApplicationNo(pageSource: string) {
    const pattern = new RegExp(`SET @application_no = '`);

    return !pattern.test(pageSource) ? null : '・冒頭変数を削除してください';
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

function checkMailCPNLinkText(pageSource: string) {
    const textPattern = new RegExp(SPECIAL_TEXT, 'i');
    const textExists = textPattern.test(pageSource);
    // 部分的な文字列が存在する場合にエラーメッセージを返す
    return !textExists ? '・"※画像がうまく表示されない方はこちら"を追加してください。' : null;

}
function checkWebCPNLinkText(pageSource: string) {
    const textPattern = new RegExp(SPECIAL_TEXT, 'i');
    const textExists = textPattern.test(pageSource);
    // 部分的な文字列が存在する場合にエラーメッセージを返す
    return textExists ? '・"※画像がうまく表示されない方はこちら"を削除してください。' : null;
}

// メール用の開封タグの確認
function checkMailOpenTag(pageSource: string) {
    const bodyTagPattern = /<!--[\s\S]*?<\/body>|<body[^>]*>/i;

    const bodyTagMatch = pageSource.match(bodyTagPattern);
    if (bodyTagMatch && typeof bodyTagMatch.index === 'number') {
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


// Web用の開封タグの確認
function checkWebOpenTag(pageSource: string) {
    const openTagPattern = /<!--\s*<custom\s+name=["']opencounter["']\s+type=["']tracking["']\s*(\/?)>\s*-->|<custom\s+name=["']opencounter["']\s+type=["']tracking["']\s*(\/?)>/i;
    if (openTagPattern.test(pageSource)) {
        return '・開封タグは削除してください';
    }
}

// noindexメタタグの確認
function checkNoIndexMetaTag(pageSource: string) {
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

// フッターの変数化チェック
function checkMailFooter(pageSource: string) {
    const footerPatternMail = /お問い合わせは%%=TreatAsContent\(@contactlink\)=%%からお願いします。/;
    const footerPatternWeb = /お問い合わせは<a href="https:\/\/www\.shizensyokuhin\.jp\/contact\/">こちら<\/a>からお願いします。/;

    if (footerPatternMail.test(pageSource)) {
        return null;
    } else if (footerPatternWeb.test(pageSource)) {
        return '・フッター変数が変数化されていません';
    }

    return null;
}
function checkWebFooter(pageSource: string) {
    const footerPatternMail = /お問い合わせは%%=TreatAsContent\(@contactlink\)=%%からお願いします。/;
    const footerPatternWeb = /お問い合わせは<a href="https:\/\/www\.shizensyokuhin\.jp\/contact\/">こちら<\/a>からお願いします。/;

    if (footerPatternWeb.test(pageSource)) {
        return null;
    } else if (footerPatternMail.test(pageSource)) {
        return '・フッター変数が変数化されていません';
    }

    return null;
}

// Google Tag Manager のチェック
function checkGTM(pageSource: string) {
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

// ファビコンのチェック
function checkFavicon(pageSource: string, isSEAC: boolean) {
    const faviconPattern = isSEAC
        ? /<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/seac\/img\/common\/favicon\.ico["']\s*>/i
        : /<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/favicon\.ico["']\s*>/i;

    const commentedFaviconPattern = isSEAC
        ? /<!--.*?<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/seac\/img\/common\/favicon\.ico["']\s*>.*?-->/i
        : /<!--.*?<link\s+rel=["']shortcut icon["']\s+href=["']\/excludes\/dmlite\/favicon\.ico["']\s*>.*?-->/i;

    const hasFavicon = faviconPattern.test(pageSource);
    const hasCommentedFavicon = commentedFaviconPattern.test(pageSource);

    return (!hasFavicon || hasCommentedFavicon) ? '・faviconの記述を確認してください' : null;
}

// 機種依存文字のチェック
const checkDependentText = (pageSource: string) => {
    const dependentSet = new Set(DependentTexts);
    const foundDependentChars: string[] = [];

    for (const char of pageSource) {
        if (!dependentSet.has(char)) {
            foundDependentChars.push(char);
        }
    }

    if (foundDependentChars.length > 0) {
        return `・機種依存文字： ${foundDependentChars} が存在します。`;
    }
};


const checkURLZenkaku = (pageSource: string): string | null => {
    // <a>タグのhref属性を抽出するための正規表現
    const aTagRegex = /<a\s+href="([^"]+)"/g;

    let match;
    const hrefs: string[] = []; // href属性を格納する配列

    // <a>タグを全て抽出
    while ((match = aTagRegex.exec(pageSource)) !== null) {
        const href = match[1];  // href属性のURL部分を取得
        hrefs.push(href);  // 配列に追加
    }

    // hrefsの中から全角文字を含むものをフィルタリングした配列を生成
    const filteredHrefs = hrefs.filter(href => /[^\x01-\x7E]/.test(href));

    // エラーメッセージを作成
    if (filteredHrefs.length > 0) {
        const errorMessage = `全角文字を含んだURLが存在します。<br>${filteredHrefs.map(href => `・${href}`).join('<br>')}`;
        return errorMessage;
    }

    return null;
};


// 日和用のチェック
// &amp;のチェック
const checkAmpText = (pageSource: string): string | null => {
    const ampTextPattern = /&amp;/i;
    const ampasandZenkaku = /＆/i;
    const errors: string[] = [];

    if (ampTextPattern.test(pageSource)) {
        errors.push('・"&amp;amp;"を"&amp;"に変換してください。<br>');
    }
    if (ampasandZenkaku.test(pageSource)) {
        errors.push('・全角の＆が存在しています。<br>');
    }
    return errors.length > 0 ? errors.join('') : null;
}

function checkButtonTextBiyori(pageSource: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageSource, 'text/html');
    const buttons = doc.querySelectorAll('.p-mail__button');
    const errors: string[] = [];

    buttons.forEach((button) => {
        const href = button.getAttribute('href');
        const buttonText = button.querySelector('.p-mail__button--text')?.textContent?.trim();

        if (href && buttonText) {
            if (href.includes('quiz') && buttonText !== '答えを見る ＞') {
                errors.push(`・新着コンテンツのテキストが誤っています。期待されるテキスト: "答えを見る ＞"`);
            } else if (href.includes('diagnosis') && buttonText !== '結果を見る ＞') {
                errors.push(`・新着コンテンツのテキストが誤っています。期待されるテキスト: "結果を見る ＞"`);
            }
        }
    });

    return errors.length > 0 ? errors.join('<br>') : null;
}

function checkButtonHrefBiyori(pageSource: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageSource, 'text/html');
    const buttons = doc.querySelectorAll('.p-mail__button');
    const errors: string[] = [];

    buttons.forEach((button, index) => {
        const href = button.getAttribute('href');

        if (href) {
            if (href.includes('quiz') && !href.endsWith('#quiz')) {
                errors.push(`・ボタン${index + 1}のhrefが誤っています。期待されるhrefの末尾: "#quiz"`);
            } else if (href.includes('diagnosis') && !href.endsWith('#diagnosis')) {
                errors.push(`・ボタン${index + 1}のhrefが誤っています。期待されるhrefの末尾: "#diagnosis"`);
            }
        }
    });

    return errors.length > 0 ? errors.join('<br>') : null;
}

export {
    checkPageTitle,
    checkMailPreheader,
    checkWebPreheader,
    checkMailApplicationNo,
    checkWebApplicationNo,
    checkImageLinks,
    checkUTMCampaign,
    checkMailCPNLinkText,
    checkWebCPNLinkText,
    checkMailOpenTag,
    checkWebOpenTag,
    checkNoIndexMetaTag,
    checkMailFooter,
    checkWebFooter,
    checkGTM,
    checkFavicon,
    checkDependentText,
    checkAmpText,
    checkButtonTextBiyori,
    checkButtonHrefBiyori,
    checkURLZenkaku,
};
