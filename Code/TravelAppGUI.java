import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import javax.swing.*;
import javax.swing.border.*;
import javax.swing.plaf.basic.BasicComboBoxUI;
import javax.swing.table.*;
import org.json.JSONObject;
import java.net.http.*;
import java.net.URI;
import java.util.*;
//import oracle.jdbc.driver.*;

// API KEY FOR LATER USE: AIzaSyDGQA1huoGom8rkzzxVnGostW2HEjxMpgI --------------------

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
        "Clendar"
    };
    private static final String[] CARD_NAMES = {
        "Conversion", "Map", "Transit", "Calendar", "RETURN"
    };

    private static final String[] CURRANCY = {
        "WILL", "HOLD", "FUTURE", "CURRENCIES"
    };

    // -- Entry point --------------------------------------------------------------
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try { UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName()); }
            catch (Exception ignored) {}
            new TravelAppGUI().setVisible(true);
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
        cardPanel.add(buildSearchPanel(),  CARD_NAMES[1]);
        cardPanel.add(buildRentalsPanel(), CARD_NAMES[2]);
        cardPanel.add(buildRentPanel(),    CARD_NAMES[3]);
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
    // CARD 1 – Currency Conversion   /* https://api.frankfurter.dev/v2/rates */
    // =========================================================================
    private JPanel buildViewPanel() {
        JPanel p = wrapCard("Currancy Conversion");

        /*JPanel btnRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        btnRow.setOpaque(false);
        
        btnRow.add(bikesBtn);
        btnRow.add(rentalsBtn);
        p.add(btnRow, BorderLayout.NORTH);*/
        
        JComboBox currSelect1 = styledComboBox("Event Currancy",   ACCENT);
        JComboBox currSelect2 = styledComboBox("Home Currency", ACCENT2);

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
    // CARD 2 – Search Bikes
    // =========================================================================
    private JPanel buildSearchPanel() {
        JPanel p = wrapCard("Search Bikes");

        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        form.setBorder(new EmptyBorder(0, 0, 16, 0));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(6, 6, 6, 6);
        gbc.anchor = GridBagConstraints.WEST;

        String[] labels = {"BikeID", "Type", "Status", "Location", "HourlyRate"};
        JTextField[] fields = new JTextField[labels.length];
        for (int i = 0; i < labels.length; i++) {
            gbc.gridx = 0; gbc.gridy = i;
            JLabel lbl = new JLabel(labels[i] + ":");
            lbl.setForeground(TEXT_SEC);
            lbl.setFont(new Font("Monospaced", Font.PLAIN, 13));
            form.add(lbl, gbc);
            gbc.gridx = 1;
            fields[i] = styledField(260);
            form.add(fields[i], gbc);
        }

        JButton searchBtn = styledButton("Search", ACCENT);
        gbc.gridx = 1; gbc.gridy = labels.length;
        form.add(searchBtn, gbc);

        JTable table = styledTable();
        JScrollPane scroll = styledScroll(table);

        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);
        top.add(form, BorderLayout.WEST);

        p.add(top,   BorderLayout.NORTH);
        p.add(scroll, BorderLayout.CENTER);

        searchBtn.addActionListener(e -> {
            List<String> conds  = new ArrayList<>();
            List<Object> params = new ArrayList<>();
            String[] colNames = {"BikeID","Type","Status","Location","HourlyRate"};
            String[] dbCols   = {"BikeID","Type","Status","Location","HourlyRate"};

            if (!fields[0].getText().trim().isEmpty()) { conds.add("BikeID = ?");                params.add(fields[0].getText().trim()); }
            if (!fields[1].getText().trim().isEmpty()) { conds.add("UPPER(Type) LIKE UPPER(?)");  params.add("%" + fields[1].getText().trim() + "%"); }
            if (!fields[2].getText().trim().isEmpty()) { conds.add("UPPER(Status) = UPPER(?)");   params.add(fields[2].getText().trim()); }
            if (!fields[3].getText().trim().isEmpty()) { conds.add("UPPER(Location) LIKE UPPER(?)"); params.add("%" + fields[3].getText().trim() + "%"); }
            if (!fields[4].getText().trim().isEmpty()) {
                try { conds.add("HourlyRate = ?"); params.add(Double.parseDouble(fields[4].getText().trim())); }
                catch (NumberFormatException ex) { showMsg("Invalid HourlyRate value.", WARNING); return; }
            }

            String sql = "SELECT BikeID, Type, Status, Location, HourlyRate FROM Bikes";
            if (!conds.isEmpty()) sql += " WHERE " + String.join(" AND ", conds);
            sql += " ORDER BY BikeID";

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                for (int i = 0; i < params.size(); i++) {
                    if (params.get(i) instanceof Double) ps.setDouble(i+1, (Double)params.get(i));
                    else ps.setString(i+1, (String)params.get(i));
                }
                ResultSet rs = ps.executeQuery();
                DefaultTableModel model = (DefaultTableModel) table.getModel();
                model.setRowCount(0);
                model.setColumnIdentifiers(colNames);
                int count = 0;
                while (rs.next()) {
                    model.addRow(new Object[]{
                        rs.getString("BikeID"), rs.getString("Type"),
                        rs.getString("Status"), rs.getString("Location"),
                        String.format("$%.2f", rs.getDouble("HourlyRate"))
                    });
                    count++;
                }
                rs.close();
                if (count == 0) showMsg("No matching bikes found.", WARNING);
                else setStatus(count + " bike(s) found.", SUCCESS);
            } catch (SQLException ex) { showMsg("Error: " + ex.getMessage(), ERROR); }
        });

        return p;
    }

    // =========================================================================
    // CARD 3 – Active Rentals
    // =========================================================================
    private JPanel buildRentalsPanel() {
        JPanel p = wrapCard("Show Active Rentals");

        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        form.setOpaque(false);
        form.setBorder(new EmptyBorder(0, 0, 16, 0));

        JComboBox<String> typeCombo = styledCombo(new String[]{"By BikeID", "By Type"});
        JTextField searchField = styledField(220);
        JButton goBtn = styledButton("Show", ACCENT);

        form.add(label("Search:"));
        form.add(typeCombo);
        form.add(searchField);
        form.add(goBtn);

        JTable table = styledTable();
        JScrollPane scroll = styledScroll(table);
        JLabel countLabel = new JLabel("");
        countLabel.setForeground(ACCENT2);
        countLabel.setFont(new Font("Monospaced", Font.BOLD, 13));

        p.add(form,        BorderLayout.NORTH);
        p.add(scroll,      BorderLayout.CENTER);
        p.add(countLabel,  BorderLayout.SOUTH);

        goBtn.addActionListener(e -> {
            String val = searchField.getText().trim();
            if (val.isEmpty()) { showMsg("Please enter a value.", WARNING); return; }
            boolean byBikeID = typeCombo.getSelectedIndex() == 0;

            String sql = byBikeID
                ? "SELECT r.BikeID, r.StudentID, TO_CHAR(r.StartTime,'YYYY-MM-DD HH24:MI:SS') AS StartTime FROM Rentals r WHERE r.BikeID = ? AND r.EndTime IS NULL"
                : "SELECT r.BikeID, r.StudentID, TO_CHAR(r.StartTime,'YYYY-MM-DD HH24:MI:SS') AS StartTime FROM Rentals r JOIN Bikes b ON r.BikeID = b.BikeID WHERE UPPER(b.Type) = UPPER(?) AND r.EndTime IS NULL ORDER BY r.BikeID";

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, val);
                ResultSet rs = ps.executeQuery();
                DefaultTableModel model = (DefaultTableModel) table.getModel();
                model.setRowCount(0);
                model.setColumnIdentifiers(new String[]{"BikeID","StudentID","StartTime"});
                List<Object[]> rows = new ArrayList<>();
                while (rs.next()) rows.add(new Object[]{rs.getString("BikeID"), rs.getString("StudentID"), rs.getString("StartTime")});
                rs.close();

                if (byBikeID && rows.size() > 1) {
                    showMsg("Inconsistent data: multiple active rentals for BikeID " + val, ERROR);
                    return;
                }
                if (rows.isEmpty()) { countLabel.setText("  0 active rentals."); setStatus("0 active rentals", WARNING); }
                else {
                    for (Object[] row : rows) model.addRow(row);
                    countLabel.setText("  Total active rentals: " + rows.size());
                    setStatus(rows.size() + " active rental(s) found.", SUCCESS);
                }
            } catch (SQLException ex) { showMsg("Error: " + ex.getMessage(), ERROR); }
        });

        return p;
    }

    // =========================================================================
    // CARD 4 – Rent a Bike
    // =========================================================================
    private JPanel buildRentPanel() {
        JPanel p = wrapCard("Rent a Bike");

        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 8, 10, 8);
        gbc.anchor = GridBagConstraints.WEST;

        JTextField bikeField    = styledField(280);
        JTextField studentField = styledField(280);

        gbc.gridx=0; gbc.gridy=0; form.add(label("BikeID:"),    gbc);
        gbc.gridx=1;              form.add(bikeField,            gbc);
        gbc.gridx=0; gbc.gridy=1; form.add(label("StudentID:"), gbc);
        gbc.gridx=1;              form.add(studentField,         gbc);

        JButton rentBtn = styledButton("Rent Bike", ACCENT2);
        rentBtn.setPreferredSize(new Dimension(140, 40));
        gbc.gridx=1; gbc.gridy=2; form.add(rentBtn, gbc);

        JTextArea output = styledTextArea();
        JScrollPane scroll = styledScroll(output);

        p.add(form,   BorderLayout.NORTH);
        p.add(scroll, BorderLayout.CENTER);

        rentBtn.addActionListener(e -> {
            String bikeID    = bikeField.getText().trim();
            String studentID = studentField.getText().trim();
            if (bikeID.isEmpty() || studentID.isEmpty()) { showMsg("BikeID and StudentID are required.", WARNING); return; }

            try {
                // Bike exists?
                PreparedStatement ps1 = con.prepareStatement("SELECT Status FROM Bikes WHERE BikeID = ?");
                ps1.setString(1, bikeID);
                ResultSet rs1 = ps1.executeQuery();
                if (!rs1.next()) { output.setText("Bike not found."); setStatus("Bike not found.", ERROR); rs1.close(); ps1.close(); return; }
                String status = rs1.getString("Status");
                rs1.close(); ps1.close();

                // Available?
                if (!status.equalsIgnoreCase("Available")) { output.setText("Bike is not available."); setStatus("Bike unavailable.", ERROR); return; }

                // No active rental?
                PreparedStatement ps2 = con.prepareStatement("SELECT COUNT(*) FROM Rentals WHERE BikeID = ? AND EndTime IS NULL");
                ps2.setString(1, bikeID);
                ResultSet rs2 = ps2.executeQuery(); rs2.next();
                int cnt = rs2.getInt(1); rs2.close(); ps2.close();
                if (cnt > 0) { output.setText("Bike is not available."); setStatus("Bike already rented.", ERROR); return; }

                // Insert rental
                PreparedStatement ps3 = con.prepareStatement("INSERT INTO Rentals (BikeID, StudentID, StartTime, EndTime) VALUES (?, ?, CURRENT_TIMESTAMP, NULL)");
                ps3.setString(1, bikeID); ps3.setString(2, studentID); ps3.executeUpdate(); ps3.close();

                // Update status
                PreparedStatement ps4 = con.prepareStatement("UPDATE Bikes SET Status = 'Rented' WHERE BikeID = ?");
                ps4.setString(1, bikeID); ps4.executeUpdate(); ps4.close();
                con.commit();

                output.setText("Success! Bike " + bikeID + " is now rented by student " + studentID + ".");
                setStatus("Rental recorded successfully.", SUCCESS);
                bikeField.setText(""); studentField.setText("");

            } catch (SQLException ex) {
                output.setText("Error: " + ex.getMessage());
                setStatus("Error renting bike.", ERROR);
                try { con.rollback(); } catch (SQLException ignored) {}
            }
        });

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

    private JComboBox<String> styledComboBox(String[] items) {
        JComboBox<String> combo = new JComboBox<>(items) {
            @Override
            public void updateUI() {
                setUI(new BasicComboBoxUI() {

                    // Style the dropdown arrow button
                    @Override
                    protected JButton createArrowButton() {
                        JButton btn = new JButton("▼");
                        btn.setBackground(BG_CARD);
                        btn.setForeground(ACCENT);
                        btn.setBorder(BorderFactory.createEmptyBorder(0, 4, 0, 4));
                        btn.setFont(new Font("Monospaced", Font.PLAIN, 10));
                        btn.setFocusPainted(false);
                        btn.setContentAreaFilled(false);
                        return btn;
                    }

                    // Style the main display area background
                    @Override
                    public void paintCurrentValueBackground(Graphics g, Rectangle bounds,
                                                            boolean hasFocus) {
                        g.setColor(BG_CARD);
                        g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
                    }
                });

                // Style the popup list that drops down
                setRenderer(new DefaultListCellRenderer() {
                    @Override
                    public Component getListCellRendererComponent(JList<?> list,
                            Object value, int index, boolean isSelected, boolean hasFocus) {
                        JLabel lbl = (JLabel) super.getListCellRendererComponent(
                                list, value, index, isSelected, hasFocus);
                        lbl.setBackground(isSelected ? ACCENT : BG_CARD);
                        lbl.setForeground(isSelected ? BG_DARK : TEXT_PRI);
                        lbl.setFont(new Font("Monospaced", Font.PLAIN, 13));
                        lbl.setBorder(new EmptyBorder(4, 8, 4, 8));
                        return lbl;
                    }
                });
            }
        };

        // Style the combo box border and background
        combo.setBackground(BG_CARD);
        combo.setForeground(TEXT_PRI);
        combo.setFont(new Font("Monospaced", Font.PLAIN, 13));
        combo.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_COL),
            new EmptyBorder(2, 8, 2, 4)
        ));
        combo.setFocusable(false);
        return combo;
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
