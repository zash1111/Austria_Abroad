import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import javax.swing.*;
import javax.swing.border.*;
import javax.swing.table.*;
//import oracle.jdbc.driver.*;

public class TravelAppGUI extends JFrame {
    
    // -- DB state --------------------------------------------------------------
    static Connection con;
    static Statement  stmt;

    // -- Palette ---------------------------------------------------------------
    private static final Color BG_DARK    = new Color(13,  17,  23);
    private static final Color BG_PANEL   = new Color(22,  27,  34);
    private static final Color BG_CARD    = new Color(30,  37,  46);
    private static final Color ACCENT     = new Color(56, 189, 248);
    private static final Color ACCENT2    = new Color(99, 235, 163);
    private static final Color TEXT_PRI   = new Color(230, 237, 243);
    private static final Color TEXT_SEC   = new Color(125, 139, 153);
    private static final Color BORDER_COL = new Color(48,  54,  61);
    private static final Color SUCCESS    = new Color(63, 185, 80);
    private static final Color ERROR      = new Color(248, 81,  73);
    private static final Color WARNING    = new Color(210, 153, 34);

    // -- Layout ------------------------------------------------------------------
    private JPanel      cardPanel;
    private CardLayout  cardLayout;
    private JLabel      statusBar;
    private JButton[]   navButtons;

    private static final String[] NAV_LABELS = {
        "Currency Conversion", "View Landmarks", "View Transit",
        "Clendar", "NULL"
    };
    private static final String[] CARD_NAMES = {
        "Conversion", "Map", "Transit", "Calendar", "RETURN"
    };

    // -- Entry point --------------------------------------------------------------
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try { UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName()); }
            catch (Exception ignored) {}
            new StudentGUI().setVisible(true);
        });
    }


    // -- Constructor --------------------------------------------------------------
    public TravelAppGUI() {
        super("AllInWon Travel Planner");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1100, 720);
        setMinimumSize(new Dimension(900, 600));
        setLocationRelativeTo(null);
        getContentPane().setBackground(BG_DARK);

        setLayout(new BorderLayout());
        add(buildHeader(),   BorderLayout.NORTH);
        add(buildSidebar(),  BorderLayout.WEST);
        add(buildContent(),  BorderLayout.CENTER);
        add(buildStatusBar(),BorderLayout.SOUTH);

        //showLoginDialog();
    }

    // =========================================================================
    // HEADER
    // =========================================================================
    private JPanel buildHeader() {
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(BG_PANEL);
        p.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, BORDER_COL));
        p.setPreferredSize(new Dimension(0, 56));

        JLabel logo = new JLabel("AllInWon");
        logo.setFont(new Font("Monospaced", Font.BOLD, 18));
        logo.setForeground(ACCENT);
        p.add(logo, BorderLayout.WEST);

        JButton exitBtn = styledButton("Exit", ERROR);
        exitBtn.setPreferredSize(new Dimension(80, 36));
        exitBtn.addActionListener(e -> {
            //closeConnection();
            System.exit(0);
        });
        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 10));
        right.setOpaque(false);
        right.add(exitBtn);
        p.add(right, BorderLayout.EAST);
        return p;
    }

    // =========================================================================
    // SIDEBAR
    // =========================================================================
    private JPanel buildSidebar() {
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBackground(BG_PANEL);
        sidebar.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, BORDER_COL));
        sidebar.setPreferredSize(new Dimension(190, 0));

        sidebar.add(Box.createVerticalStrut(20));

        navButtons = new JButton[NAV_LABELS.length];
        String[] icons = {"Conversion", "Map", "Tranit", "Calendar"};
        for (int i = 0; i < NAV_LABELS.length; i++) {
            final int idx = i;
            JButton btn = new JButton(icons[i] + "  " + NAV_LABELS[i]);
            btn.setAlignmentX(Component.CENTER_ALIGNMENT);
            btn.setMaximumSize(new Dimension(170, 42));
            btn.setPreferredSize(new Dimension(170, 42));
            btn.setFocusPainted(false);
            btn.setBorderPainted(false);
            btn.setFont(new Font("Monospaced", Font.PLAIN, 13));
            btn.setForeground(TEXT_SEC);
            btn.setBackground(BG_PANEL);
            btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            btn.setHorizontalAlignment(SwingConstants.LEFT);
            btn.addActionListener(e -> switchCard(idx));
            btn.addMouseListener(new MouseAdapter() {
                public void mouseEntered(MouseEvent e) {
                    if (!btn.getForeground().equals(ACCENT)) btn.setForeground(TEXT_PRI);
                }
                public void mouseExited(MouseEvent e) {
                    if (!btn.getForeground().equals(ACCENT)) btn.setForeground(TEXT_SEC);
                }
            });
            navButtons[i] = btn;
            sidebar.add(btn);
            sidebar.add(Box.createVerticalStrut(4));
        }
        sidebar.add(Box.createVerticalGlue());
        return sidebar;
    }

    private void switchCard(int idx) {
        for (JButton b : navButtons) { b.setForeground(TEXT_SEC); b.setBackground(BG_PANEL); }
        navButtons[idx].setForeground(ACCENT);
        navButtons[idx].setBackground(BG_CARD);
        cardLayout.show(cardPanel, CARD_NAMES[idx]);
    }

    // =========================================================================
    // CONTENT (CardLayout)
    // =========================================================================
    private JPanel buildContent() {
        cardLayout = new CardLayout();
        cardPanel  = new JPanel(cardLayout);
        cardPanel.setBackground(BG_DARK);

        cardPanel.add(buildViewPanel(),    CARD_NAMES[0]);
        //cardPanel.add(buildSearchPanel(),  CARD_NAMES[1]);
        //cardPanel.add(buildRentalsPanel(), CARD_NAMES[2]);
        //cardPanel.add(buildRentPanel(),    CARD_NAMES[3]);
        //cardPanel.add(buildReturnPanel(),  CARD_NAMES[4]);

        return cardPanel;
    }

    // =========================================================================
    // STATUS BAR
    // =========================================================================
    private JPanel buildStatusBar() {
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(BG_PANEL);
        p.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, BORDER_COL));
        p.setPreferredSize(new Dimension(0, 30));
        statusBar = new JLabel("  Ready");
        statusBar.setFont(new Font("Monospaced", Font.PLAIN, 12));
        statusBar.setForeground(TEXT_SEC);
        p.add(statusBar, BorderLayout.WEST);
        return p;
    }

    private void setStatus(String msg, Color color) {
        statusBar.setText("  " + msg);
        statusBar.setForeground(color);
    }

    // =========================================================================
    // CARD 1 – Currency Conversion
    // =========================================================================
    private JPanel buildViewPanel() {
        JPanel p = wrapCard("Currancy Conversion");

        /*JPanel btnRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        btnRow.setOpaque(false);
        JButton bikesBtn   = styledButton("Show Bikes",   ACCENT);
        JButton rentalsBtn = styledButton("Show Rentals", ACCENT2);
        btnRow.add(bikesBtn);
        btnRow.add(rentalsBtn);
        p.add(btnRow, BorderLayout.NORTH);*/

        JTable table = styledTable();
        JScrollPane scroll = styledScroll(table);
        p.add(scroll, BorderLayout.CENTER);

        /*bikesBtn.addActionListener(e -> {
            String sql = "SELECT BikeID, Type, Status, Location, HourlyRate FROM Bikes ORDER BY BikeID";
            populateTable(table, sql, new String[]{"BikeID","Type","Status","Location","HourlyRate"});
            setStatus("Loaded Bikes table", SUCCESS);
        });
        rentalsBtn.addActionListener(e -> {
            String sql = "SELECT BikeID, StudentID, StartTime, EndTime FROM Rentals ORDER BY BikeID, StartTime";
            populateTable(table, sql, new String[]{"BikeID","StudentID","StartTime","EndTime"});
            setStatus("Loaded Rentals table", SUCCESS);
        });*/
        return p;
    }

    // =========================================================================
    // UI HELPERS
    // =========================================================================
    private JPanel wrapCard(String title) {
        JPanel p = new JPanel(new BorderLayout(0, 16));
        p.setBackground(BG_DARK);
        p.setBorder(new EmptyBorder(24, 28, 24, 28));

        JLabel h = new JLabel(title);
        h.setFont(new Font("Monospaced", Font.BOLD, 20));
        h.setForeground(TEXT_PRI);
        h.setBorder(new EmptyBorder(0, 0, 16, 0));
        p.add(h, BorderLayout.NORTH);
        return p;
    }

    private JButton styledButton(String text, Color accent) {
        JButton btn = new JButton(text);
        btn.setBackground(BG_CARD);
        btn.setForeground(accent);
        btn.setFont(new Font("Monospaced", Font.BOLD, 13));
        btn.setFocusPainted(false);
        btn.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(accent, 1),
            new EmptyBorder(6, 16, 6, 16)
        ));
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setBackground(accent); btn.setForeground(BG_DARK); }
            public void mouseExited (MouseEvent e) { btn.setBackground(BG_CARD); btn.setForeground(accent); }
        });
        return btn;
    }

    private JTextField styledField(int width) {
        JTextField f = new JTextField();
        f.setPreferredSize(new Dimension(width, 34));
        f.setBackground(BG_CARD);
        f.setForeground(TEXT_PRI);
        f.setCaretColor(ACCENT);
        f.setFont(new Font("Monospaced", Font.PLAIN, 13));
        f.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_COL),
            new EmptyBorder(4, 8, 4, 8)
        ));
        return f;
    }

    private void stylePasswordField(JPasswordField f) {
        f.setPreferredSize(new Dimension(200, 34));
        f.setBackground(BG_CARD);
        f.setForeground(TEXT_PRI);
        f.setCaretColor(ACCENT);
        f.setFont(new Font("Monospaced", Font.PLAIN, 13));
        f.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_COL),
            new EmptyBorder(4, 8, 4, 8)
        ));
    }

    private JComboBox<String> styledCombo(String[] items) {
        JComboBox<String> c = new JComboBox<>(items);
        c.setBackground(BG_CARD);
        c.setForeground(TEXT_PRI);
        c.setFont(new Font("Monospaced", Font.PLAIN, 13));
        return c;
    }

    private JTable styledTable() {
        DefaultTableModel model = new DefaultTableModel() {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        JTable table = new JTable(model);
        table.setBackground(BG_CARD);
        table.setForeground(TEXT_PRI);
        table.setFont(new Font("Monospaced", Font.PLAIN, 13));
        table.setRowHeight(28);
        table.setGridColor(BORDER_COL);
        table.setSelectionBackground(new Color(56, 189, 248, 60));
        table.setSelectionForeground(TEXT_PRI);
        table.setShowGrid(true);
        JTableHeader header = table.getTableHeader();
        header.setBackground(BG_PANEL);
        header.setForeground(ACCENT);
        header.setFont(new Font("Monospaced", Font.BOLD, 13));
        header.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, BORDER_COL));
        return table;
    }

    private JScrollPane styledScroll(Component c) {
        JScrollPane sp = new JScrollPane(c);
        sp.setBackground(BG_DARK);
        sp.getViewport().setBackground(BG_CARD);
        sp.setBorder(BorderFactory.createLineBorder(BORDER_COL));
        sp.getVerticalScrollBar().setBackground(BG_PANEL);
        sp.getHorizontalScrollBar().setBackground(BG_PANEL);
        return sp;
    }

    private JTextArea styledTextArea() {
        JTextArea ta = new JTextArea();
        ta.setBackground(BG_CARD);
        ta.setForeground(TEXT_PRI);
        ta.setFont(new Font("Monospaced", Font.PLAIN, 14));
        ta.setEditable(false);
        ta.setLineWrap(true);
        ta.setWrapStyleWord(true);
        ta.setBorder(new EmptyBorder(12, 12, 12, 12));
        ta.setCaretColor(ACCENT);
        return ta;
    }

    private JLabel label(String text) {
        JLabel l = new JLabel(text);
        l.setForeground(TEXT_SEC);
        l.setFont(new Font("Monospaced", Font.PLAIN, 13));
        return l;
    }

    private void showMsg(String msg, Color color) {
        setStatus(msg, color);
        JOptionPane.showMessageDialog(this, msg, "Notice", JOptionPane.INFORMATION_MESSAGE);
    }

}
