const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

const PN  = { ny:'녕', ju:'준', su:'숭', bbo:'뽀' };
const TPL = {
  plan:    '공부 계획을 세웠어요 ✏️',
  partial: '계획을 한 걸음 달성했어요 🔥',
  done:    '계획을 모두 달성했어요 🎉'
};

// notifications/{id} 에 새 글이 써지면 → 작성자 빼고 나머지 기기에 푸시
exports.notifyOnPlan = functions.database
  .ref('/notifications/{id}')
  .onCreate(async (snap) => {
    const n = snap.val() || {};
    const author = n.p, type = n.type;
    if (!TPL[type] || !PN[author]) return null;

    const dayLabel = n.date ? (parseInt(n.date.slice(8), 10) + '일 ') : '';
    const title = '📚 studyLog';
    const body  = PN[author] + '님이 ' + dayLabel + TPL[type];

    const tokSnap = await admin.database().ref('fcmTokens').once('value');
    const tokens = [], keyOf = {};
    tokSnap.forEach((c) => {
      const v = c.val() || {};
      if (v.token && v.p !== author) { tokens.push(v.token); keyOf[v.token] = c.key; }
    });
    if (!tokens.length) return null;

    const URL = 'https://pkh0848-rgb.github.io/study-calendar/';
    const ICON = URL + 'icon-192.png';
    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { url: URL },
      webpush: {
        headers: { Urgency: 'high', TTL: '86400' },
        notification: { title, body, icon: ICON, badge: ICON, tag: 'studylog' },
        fcmOptions: { link: URL }
      }
    });

    // 죽은 토큰 정리
    const rm = [];
    res.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error && r.error.code;
        if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-argument') {
          const k = keyOf[tokens[i]]; if (k) rm.push(admin.database().ref('fcmTokens/' + k).remove());
        }
      }
    });
    await Promise.all(rm);
    console.log('sent', res.successCount, '/', tokens.length);
    return null;
  });
