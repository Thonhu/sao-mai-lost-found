const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const API = '/api/items';

let adminItems = [];

const historyOpen = new Set();
const historyCache = {};


/* =========================================================
   NGÔN NGỮ
========================================================= */

const I = {

  vi: {

    subtitle: 'Housekeeping · Quản lý đồ thất lạc',

    createTab: 'Ghi nhận đồ thất lạc',
    manageTab: 'Quản lý',
    rulesTab: 'Quy định',

    heroTitle: 'Ghi nhận đồ thất lạc',
    heroText: 'Nhập thông tin và hình ảnh món đồ để lưu vào hệ thống Housekeeping.',

    itemName: 'Tên món đồ',

    guestName: 'Tên khách',
    guestNamePlaceholder: 'Tên khách nếu xác định được',

    room: 'Phòng / khu vực',
    roomShort: 'Phòng',

    foundAt: 'Ngày giờ',

    storage: 'Vị trí lưu kho',
    storageShort: 'Kho',

    description: 'Mô tả',

    photo: 'Ảnh',
    photoHint: 'Chụp hoặc chọn 1 ảnh, tối đa 8 MB.',

    save: 'Lưu món đồ',
    reset: 'Nhập lại',

    created: 'Đã ghi nhận thành công',
    newItem: 'Ghi nhận món khác',

    manageTitle: 'Quản lý đồ thất lạc',

    manageHint:
      'Mở danh sách bằng PIN quản lý để cập nhật trạng thái, kho, người nhận và lịch sử.',

    openList: 'Mở danh sách',

    stored: 'Đang lưu giữ',
    returned: 'Đã trả khách',
    disposed: 'Đã xử lý',
    cancelled: 'Đã hủy',

    total: 'Tổng số',

    allStatuses: 'Tất cả trạng thái',

    refresh: 'Làm mới',

    code: 'Mã',
    status: 'Trạng thái',
    receiver: 'Người nhận lại',
    actions: 'Thao tác',

    search: 'Mã, tên đồ, tên khách, phòng, kho...',

    move: 'Chuyển kho',
    returnItem: 'Trả khách',
    dispose: 'Đã xử lý',
    restore: 'Khôi phục',

    history: 'Lịch sử',
    hideHistory: 'Ẩn lịch sử',

    delete: 'Xóa',

    rulesTitle: 'Quy định quản lý đồ thất lạc',

    rule1:
      'Mọi đồ thất lạc phải được ghi nhận ngay khi phát hiện, kèm hình ảnh và vị trí tìm thấy.',

    rule2:
      'Đồ thất lạc phải được bảo quản tại vị trí lưu kho đã ghi trong hệ thống.',

    rule3:
      'Chỉ bàn giao đồ khi đã xác minh người nhận phù hợp; tên người nhận phải được ghi lại.',

    rule4:
      'Mọi thay đổi trạng thái, vị trí lưu kho và việc trả đồ đều được lưu vào lịch sử.',

    rule5:
      'Việc xử lý hoặc xóa dữ liệu chỉ thực hiện bởi người có PIN quản lý.',

    log_created: 'Ghi nhận',
    log_storage_changed: 'Chuyển kho',
    log_returned: 'Trả khách',
    log_disposed: 'Xử lý',
    log_restored: 'Khôi phục'
  },


  en: {

    subtitle: 'Housekeeping · Lost & Found Management',

    createTab: 'Record lost item',
    manageTab: 'Management',
    rulesTab: 'Rules',

    heroTitle: 'Record a lost item',

    heroText:
      'Enter the item details and photo for the Housekeeping Lost & Found system.',

    itemName: 'Item name',

    guestName: 'Guest name',
    guestNamePlaceholder: 'Guest name if known',

    room: 'Room / area',
    roomShort: 'Room',

    foundAt: 'Date & time',

    storage: 'Storage location',
    storageShort: 'Storage',

    description: 'Description',

    photo: 'Photo',
    photoHint: 'Take or choose 1 image, maximum 8 MB.',

    save: 'Save item',
    reset: 'Reset',

    created: 'Recorded successfully',
    newItem: 'Record another item',

    manageTitle: 'Lost & Found Management',

    manageHint:
      'Open the list with the management PIN to update status, storage, receiver and history.',

    openList: 'Open list',

    stored: 'Stored',
    returned: 'Returned to guest',
    disposed: 'Disposed',
    cancelled: 'Cancelled',

    total: 'Total',

    allStatuses: 'All statuses',

    refresh: 'Refresh',

    code: 'Code',
    status: 'Status',
    receiver: 'Receiver',
    actions: 'Actions',

    search: 'Code, item, guest, room, storage...',

    move: 'Move storage',
    returnItem: 'Return to guest',
    dispose: 'Dispose',
    restore: 'Restore',

    history: 'History',
    hideHistory: 'Hide history',

    delete: 'Delete',

    rulesTitle: 'Lost & Found Rules',

    rule1:
      'All found property must be recorded immediately with a photo and the location where it was found.',

    rule2:
      'Found property must be kept at the storage location recorded in the system.',

    rule3:
      'Items may only be handed over after the receiver has been appropriately verified; the receiver name must be recorded.',

    rule4:
      'All status, storage and return changes are recorded in item history.',

    rule5:
      'Disposal or data deletion may only be performed by a person with the management PIN.',

    log_created: 'Recorded',
    log_storage_changed: 'Storage moved',
    log_returned: 'Returned',
    log_disposed: 'Disposed',
    log_restored: 'Restored'
  }

};


/* =========================================================
   HÀM CƠ BẢN
========================================================= */

function L() {
  return $('#language')?.value || 'vi';
}


function T(key) {
  return I[L()]?.[key] || key;
}


function E(value) {

  return String(value ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]
  );

}


function DT(value) {

  if (!value) return '';

  return new Date(value).toLocaleString(
    L() === 'vi'
      ? 'vi-VN'
      : 'en-GB'
  );

}


async function APIX(url, options = {}) {

  const response = await fetch(url, options);

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {

    throw new Error(
      data.error || 'Error'
    );

  }

  return data;

}


/* =========================================================
   NGÀY GIỜ MẶC ĐỊNH
========================================================= */

function setDefaultTime() {

  const d = new Date(
    Date.now() -
    new Date().getTimezoneOffset() * 60000
  );

  if ($('#foundAt')) {

    $('#foundAt').value =
      d.toISOString().slice(0, 16);

  }

}


/* =========================================================
   ĐỔI NGÔN NGỮ
========================================================= */

function applyLang() {

  document.documentElement.lang = L();

  localStorage.lfLang = L();


  $$('[data-i18n]').forEach(el => {

    const value =
      T(el.dataset.i18n);

    if (value) {

      el.textContent = value;

    }

  });


  $$('[data-i18n-placeholder]').forEach(el => {

    const value =
      T(el.dataset.i18nPlaceholder);

    if (value) {

      el.placeholder = value;

    }

  });


  render();

}


/* =========================================================
   KHỞI TẠO NGÔN NGỮ
========================================================= */

if ($('#language')) {

  $('#language').value =
    localStorage.lfLang || 'vi';

  $('#language').onchange =
    applyLang;

}


if ($('#year')) {

  $('#year').textContent =
    new Date().getFullYear();

}


/* =========================================================
   TAB
========================================================= */

$$('.tab').forEach(btn => {

  btn.onclick = () => {

    $$('.tab').forEach(x =>
      x.classList.remove('active')
    );

    $$('.panel').forEach(x =>
      x.classList.remove('active')
    );

    btn.classList.add('active');

    const panel =
      $('#' + btn.dataset.tab);

    if (panel) {

      panel.classList.add('active');

    }

  };

});


/* =========================================================
   XEM TRƯỚC ẢNH
========================================================= */

if ($('#photo')) {

  $('#photo').onchange = e => {

    const file =
      e.target.files?.[0];

    if (!file) {

      $('#photoPreview')
        ?.classList.add('hidden');

      return;

    }

    const url =
      URL.createObjectURL(file);

    $('#photoPreview').innerHTML = `
      <img
        src="${url}"
        alt="Lost item"
      >
    `;

    $('#photoPreview')
      .classList.remove('hidden');

  };

}


/* =========================================================
   TẠO MÓN ĐỒ THẤT LẠC
========================================================= */

if ($('#itemForm')) {

  $('#itemForm').onsubmit =
    async e => {

      e.preventDefault();

      const btn =
        $('#createBtn');

      const oldText =
        btn.textContent;

      btn.disabled = true;
      btn.textContent = '...';

      try {

        const fd =
          new FormData(e.currentTarget);


        const local =
          $('#foundAt')?.value;

        if (local) {

          fd.set(
            'found_at',
            new Date(local).toISOString()
          );

        }


        const result =
          await APIX(
            API,
            {
              method: 'POST',
              body: fd
            }
          );


        $('#createdCode').textContent =
          result.code;


        $('#successBox')
          .classList.remove('hidden');


        $('#successBox')
          .scrollIntoView({
            behavior: 'smooth'
          });

      }

      catch (err) {

        alert(err.message);

      }

      finally {

        btn.disabled = false;
        btn.textContent = oldText;

      }

    };


  $('#itemForm').onreset = () => {

    setTimeout(
      () => {

        setDefaultTime();

        if ($('#photoPreview')) {

          $('#photoPreview').innerHTML = '';

          $('#photoPreview')
            .classList.add('hidden');

        }

      },
      0
    );

  };

}


/* =========================================================
   GHI NHẬN MÓN MỚI
========================================================= */

if ($('#newItemBtn')) {

  $('#newItemBtn').onclick = () => {

    $('#itemForm')?.reset();

    $('#successBox')
      ?.classList.add('hidden');

    $('#itemName')?.focus();

  };

}


/* =========================================================
   QUẢN LÝ
========================================================= */

async function loadAdmin() {

  try {

    adminItems =
      await APIX(
        API,
        {
          headers: {
            'x-admin-pin':
              $('#adminPin').value
          }
        }
      );


    $('#adminArea')
      .classList.remove('hidden');


    render();

  }

  catch (err) {

    alert(err.message);

  }

}


if ($('#loadAdmin')) {

  $('#loadAdmin').onclick =
    loadAdmin;

}


if ($('#refreshAdmin')) {

  $('#refreshAdmin').onclick =
    loadAdmin;

}


if ($('#adminSearch')) {

  $('#adminSearch').oninput =
    render;

}


if ($('#statusFilter')) {

  $('#statusFilter').onchange =
    render;

}


/* =========================================================
   LỊCH SỬ
========================================================= */

function historyLabel(action) {

  const map = {

    created:
      'log_created',

    storage_changed:
      'log_storage_changed',

    returned:
      'log_returned',

    disposed:
      'log_disposed',

    restored:
      'log_restored'

  };


  return T(
    map[action] || action
  );

}


function translateDetail(log) {

  const s =
    String(log.detail || '');


  if (L() === 'vi') {

    return s;

  }


  if (log.action === 'created') {

    return 'Item recorded in the system';

  }


  if (
    log.action ===
    'storage_changed'
  ) {

    return 'Storage location updated';

  }


  if (log.action === 'returned') {

    return s.replace(
      /^Đã trả cho:\s*/i,
      'Returned to: '
    );

  }


  if (log.action === 'disposed') {

    return 'Item disposed';

  }


  if (log.action === 'restored') {

    return 'Status restored to Stored';

  }


  return s;

}


function historyHTML(code) {

  const logs =
    historyCache[code];


  if (!logs) {

    return `
      <div class="history-box">
        ${
          L() === 'vi'
            ? 'Đang tải lịch sử...'
            : 'Loading history...'
        }
      </div>
    `;

  }


  if (!logs.length) {

    return `
      <div class="history-box">
        ${
          L() === 'vi'
            ? 'Chưa có lịch sử.'
            : 'No history yet.'
        }
      </div>
    `;

  }


  return `
    <div class="history-box">

      <div class="history-title">
        ${T('history')} ${E(code)}
      </div>

      ${logs.map(log => `

        <div class="history-item">

          <span class="history-time">
            ${E(DT(log.created_at))}
          </span>

          <span class="history-action">
            ${E(historyLabel(log.action))}
          </span>

          <span class="history-detail">
            ${E(translateDetail(log))}
          </span>

        </div>

      `).join('')}

    </div>
  `;

}


async function loadHistory(code) {

  try {

    historyCache[code] =
      await APIX(
        `${API}/${encodeURIComponent(code)}/logs`,
        {
          headers: {
            'x-admin-pin':
              $('#adminPin').value
          }
        }
      );

  }

  catch (err) {

    historyCache[code] = [

      {
        action: 'error',
        detail: err.message,
        created_at:
          new Date().toISOString()
      }

    ];

  }


  render();

}


window.toggleHistory =
  async code => {

    if (
      historyOpen.has(code)
    ) {

      historyOpen.delete(code);

      render();

      return;

    }


    historyOpen.add(code);

    render();


    if (!historyCache[code]) {

      await loadHistory(code);

    }

  };


/* =========================================================
   NÚT THAO TÁC
========================================================= */

function actionButtons(item) {

  let html = '';


  if (
    item.status === 'stored'
  ) {

    html += `
      <button
        class="secondary small-btn"
        onclick="moveStorage('${item.code}')"
      >
        ${T('move')}
      </button>
    `;


    html += `
      <button
        class="primary small-btn"
        onclick="returnItem('${item.code}')"
      >
        ${T('returnItem')}
      </button>
    `;


    html += `
      <button
        class="danger small-btn"
        onclick="disposeItem('${item.code}')"
      >
        ${T('dispose')}
      </button>
    `;

  }

  else {

    html += `
      <button
        class="secondary small-btn"
        onclick="restoreItem('${item.code}')"
      >
        ${T('restore')}
      </button>
    `;

  }


  html += `
    <button
      class="history-btn small-btn"
      onclick="toggleHistory('${item.code}')"
    >
      ${
        historyOpen.has(item.code)
          ? T('hideHistory')
          : T('history')
      }
    </button>
  `;


  html += `
    <button
      class="danger small-btn"
      onclick="deleteItem('${item.code}')"
    >
      ${T('delete')}
    </button>
  `;


  return `
    <div class="action-buttons">
      ${html}
    </div>
  `;

}


/* =========================================================
   HIỂN THỊ DANH SÁCH
========================================================= */

function render() {

  if (!$('#adminRows')) return;


  const search =
    (
      $('#adminSearch')?.value ||
      ''
    ).toLowerCase();


  const status =
    $('#statusFilter')?.value ||
    '';


  const filtered =
    adminItems.filter(item => {

      const okStatus =
        !status ||
        item.status === status;


      const text =
        JSON.stringify(item)
          .toLowerCase();


      return (
        okStatus &&
        text.includes(search)
      );

    });


  $('#countStored').textContent =
    adminItems.filter(
      x => x.status === 'stored'
    ).length;


  $('#countReturned').textContent =
    adminItems.filter(
      x => x.status === 'returned'
    ).length;


  $('#countDisposed').textContent =
    adminItems.filter(
      x => x.status === 'disposed'
    ).length;


  $('#countTotal').textContent =
    adminItems.length;


  $('#adminRows').innerHTML =
    filtered.map(item => {


      const guestText =
        item.guest_name
          ? `
            <br>
            <small>
              ${T('guestName')}: ${E(item.guest_name)}
            </small>
          `
          : '';


      const row = `

        <tr>

          <td>

            ${
              item.photo_id

                ? `
                  <img
                    class="thumb"
                    src="/api/photos/${item.photo_id}"
                    alt=""
                  >
                `

                : '—'
            }

          </td>


          <td
            class="code-cell"
            title="${E(item.code)}"
          >

            …${E(
              String(item.code)
                .slice(-4)
            )}

          </td>


          <td>

            <b>
              ${E(item.item_name)}
            </b>

            ${guestText}

            ${
              item.description

                ? `
                  <br>
                  <small>
                    ${E(item.description)}
                  </small>
                `

                : ''
            }

          </td>


          <td>
            ${E(item.room_number || '')}
          </td>


          <td>
            ${E(DT(item.found_at))}
          </td>


          <td>
            ${E(item.storage_location || '')}
          </td>


          <td>

            <span
              class="status ${E(item.status)}"
            >

              ${E(T(item.status))}

            </span>

          </td>


          <td>

            ${E(
              item.returned_to ||
              '—'
            )}

            ${
              item.returned_at

                ? `
                  <br>
                  <small>
                    ${E(
                      DT(item.returned_at)
                    )}
                  </small>
                `

                : ''
            }

          </td>


          <td>
            ${actionButtons(item)}
          </td>

        </tr>

      `;


      const history =
        historyOpen.has(item.code)

          ? `
            <tr class="history-row">

              <td colspan="9">

                ${historyHTML(item.code)}

              </td>

            </tr>
          `

          : '';


      return row + history;

    }).join('');

}


/* =========================================================
   PATCH
========================================================= */

async function patch(
  code,
  body
) {

  const result =
    await APIX(
      `${API}/${encodeURIComponent(code)}`,
      {
        method: 'PATCH',

        headers: {

          'content-type':
            'application/json',

          'x-admin-pin':
            $('#adminPin').value

        },

        body:
          JSON.stringify(body)
      }
    );


  delete historyCache[code];


  await loadAdmin();


  if (
    historyOpen.has(code)
  ) {

    await loadHistory(code);

  }


  return result;

}


/* =========================================================
   CHUYỂN KHO
========================================================= */

window.moveStorage =
  async code => {

    const value =
      prompt(
        L() === 'vi'
          ? 'Vị trí lưu kho mới:'
          : 'New storage location:'
      );


    if (!value) return;


    try {

      await patch(
        code,
        {
          action: 'move_storage',
          storage_location: value
        }
      );

    }

    catch (err) {

      alert(err.message);

    }

  };


/* =========================================================
   TRẢ KHÁCH
========================================================= */

window.returnItem =
  async code => {

    const receiver =
      prompt(
        L() === 'vi'
          ? 'Tên người nhận lại:'
          : 'Receiver name:'
      );


    if (!receiver) return;


    const ok =
      confirm(

        L() === 'vi'

          ? `Xác nhận đã trả đồ cho ${receiver}?`

          : `Confirm item returned to ${receiver}?`

      );


    if (!ok) return;


    try {

      await patch(
        code,
        {
          action: 'return_item',
          returned_to: receiver
        }
      );

    }

    catch (err) {

      alert(err.message);

    }

  };


/* =========================================================
   ĐÃ XỬ LÝ
========================================================= */

window.disposeItem =
  async code => {

    const ok =
      confirm(

        L() === 'vi'

          ? 'Xác nhận đánh dấu món đồ là Đã xử lý?'

          : 'Mark this item as Disposed?'

      );


    if (!ok) return;


    try {

      await patch(
        code,
        {
          action: 'dispose_item'
        }
      );

    }

    catch (err) {

      alert(err.message);

    }

  };


/* =========================================================
   KHÔI PHỤC
========================================================= */

window.restoreItem =
  async code => {

    const ok =
      confirm(

        L() === 'vi'

          ? 'Khôi phục món đồ về trạng thái Đang lưu giữ?'

          : 'Restore item to Stored status?'

      );


    if (!ok) return;


    try {

      await patch(
        code,
        {
          action: 'restore_item'
        }
      );

    }

    catch (err) {

      alert(err.message);

    }

  };


/* =========================================================
   XÓA
========================================================= */

window.deleteItem =
  async code => {

    const ok =
      confirm(

        L() === 'vi'

          ? `Xóa vĩnh viễn ${code} và ảnh?`

          : `Permanently delete ${code} and its photo?`

      );


    if (!ok) return;


    try {

      await APIX(
        `${API}/${encodeURIComponent(code)}`,
        {
          method: 'DELETE',

          headers: {
            'x-admin-pin':
              $('#adminPin').value
          }
        }
      );


      historyOpen.delete(code);

      delete historyCache[code];


      await loadAdmin();

    }

    catch (err) {

      alert(err.message);

    }

  };


/* =========================================================
   KHỞI ĐỘNG
========================================================= */

setDefaultTime();

applyLang();
