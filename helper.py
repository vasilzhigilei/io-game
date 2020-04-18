
def player_distance(player1, player2):
    return ((player2['x'] - player1['x'])**2 + (player2['y'] - player1['y'])**2)**0.5

def distance(player, x, y):
    return ((player['x'] - x) ** 2 + (player['y'] - y) ** 2) ** 0.5