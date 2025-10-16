export const resetPasswordTemplate = (resetLink: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 20px; color: #f1f5f9;">
    <div style="max-width: 600px; margin: auto; background: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.7);">
      
      <!-- Header -->
      <div style="
        background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://i.pinimg.com/736x/b8/4a/af/b84aaffda0f506c229d7428bae5564a2.jpg'); 
        background-size: cover; 
        background-position: center;
        padding: 40px 20px; 
        text-align: center; 
        color: #fff;">
        
        <img src="https://i.pinimg.com/1200x/e0/3a/70/e03a70c9078b128917923a48197aab4d.jpg" 
             alt="Booking Cinema" 
             style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin-bottom: 15px; border: 3px solid #fff;" />
        
        <h1 style="
          font-size: 34px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(to right, #ec4899, #facc15, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 1px;
        ">
          Booking Ticker Cinema 🎬
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #f1f5f9; font-size: 16px;">
        <p style="margin: 0 0 12px;">Xin chào,</p>
        <p style="margin: 0 0 12px;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p style="margin: 0 0 20px;">Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetLink}" 
             style="background: linear-gradient(to right, #ef4444, #f59e0b); 
                    color: #fff; 
                    padding: 16px 28px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    font-size: 18px; 
                    display: inline-block;
                    box-shadow: 0 4px 14px rgba(239,68,68,0.6);">
            <span style="font-size:18px; margin-right:8px;">🎟️</span> 
            <span style="color:#fff;">Đặt lại mật khẩu</span>
          </a>
        </div>

        <p style="font-size: 14px; color: #cbd5e1;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        <p style="margin-top: 30px; font-size: 14px;">Trân trọng,<br/>Booking Ticker Cinema Team</p>
      </div>

      <!-- Footer -->
      <div style="background: #0f172a; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Booking Ticker Cinema. All rights reserved.
      </div>

    </div>
  </div>
`;
