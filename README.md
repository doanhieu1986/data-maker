# data-maker

1) Những event đang có trong code (đang dataLayer.push)
product_details_click với param product (vd: margin-details)
newsletter_open, newsletter_close
scroll_to_faq_end
register_product với param products (mảng checkbox)
purchase_product với param product, quantity
form_submit với form_id, form_name, form_destination
consultation_form_submit với investment_experience, investment_amount
register_account với user_name/user_email/user_phone (không nên gửi sang GA4)

Trong script.js giờ sẽ đẩy các event sau lên dataLayer:
select_item khi bấm “Tìm hiểu thêm” sản phẩm
Params: item_list_name, items[{ item_id, item_name }]
generate_lead khi submit:
form tư vấn (lead_type="consultation")
form đăng ký sản phẩm (lead_type="register_products")
Params: lead_type, form_id, form_name, investment_experience, investment_amount, products_selected, products_count
sign_up khi submit form mở tài khoản
Params: method, form_id, form_name
purchase khi submit mua hàng giả lập
Params: transaction_id, currency, value, items[{ item_id, item_name, price, quantity }]
Giữ custom (không có recommended tương ứng trực tiếp):
newsletter_modal (action=open/close, modal_name, placement)
scroll_to_faq_end (section)
Và vẫn có form_submit cho consultationForm (để tránh Enhanced Measurement bị miss do preventDefault())